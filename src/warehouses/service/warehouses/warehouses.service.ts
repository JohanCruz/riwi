import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Warehouse } from 'src/typeorm/entities/Warehouse';
import { User } from 'src/typeorm/entities/User';
import { createWarehouseParams, updateWarehouseParams, 
    createProductParams, createInventorytParams, relocateProductParams } from 'src/types/types';
import { Repository,  } from 'typeorm';
import { Product } from 'src/typeorm/entities/Product';
import { Inventory } from 'src/typeorm/entities/Inventory';
import { DataSource } from 'typeorm';
import { Record } from 'src/typeorm/entities/Record';
import { ExeQuery } from 'src/warehouses/helper/queries'
import { CallException } from 'src/warehouses/helper/exceptions';


@Injectable()
export class WarehousesService {

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        @InjectRepository(Warehouse) private warehouseRepository: Repository<Warehouse>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
        @InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>,
        @InjectRepository(Record) private recordRepository: Repository<Record> 
    ){}    

    searchAll() {
        return this.warehouseRepository.find()
    }

    SearchStore(id: number){
        return this.warehouseRepository.find({
            where:{id: id}
        });
    }

    /*
    To create a warehouse with responsible, 3 input data are needed
    {
    "ubication": "Bogotá Norte",
    "description": "5500m2",
    "id_responsable": 1
    }

    To create a warehouse without responsible, only 2 input data are needed
    {
    "ubication": "Bogotá Norte",
    "description": "5500m2"
    }
    */
    async createStore(warehouseDetails: createWarehouseParams){
        let user;

        if('id_responsable' in warehouseDetails){
            const id = warehouseDetails["id_responsable"]
            user = await this.userRepository.findOneBy({id})            
        }
        
        if('id_responsable' in warehouseDetails && !user){
            throw new HttpException(
                "user not found",
                HttpStatus.BAD_REQUEST,
            );
        }

        const newWarehouse = user? this.warehouseRepository.create({ 
            ...warehouseDetails,
            created_at: new Date(),
            user,
        }): this.warehouseRepository.create({ 
            ...warehouseDetails,
            created_at: new Date(),
            
        })      
        return await  this.warehouseRepository.save(newWarehouse)       
    }


    updateStore(id: number, warehouseDetails: updateWarehouseParams){
        this.warehouseRepository.update( { id }, {... warehouseDetails}
        )
    }
    
    deleteStore(id: number){
        return this.warehouseRepository.delete({id})
    }


    async searchAllProducts() {       

        const products  = await this.productRepository.manager.query(
            `SELECT SUM(inventories.cantidad) AS Total, nombre, products.id
            FROM products 
            INNER JOIN inventories
            ON products.id = inventories.id_product
            GROUP BY products.id`
        );

        return products;
    }


    async createProduct(productDetails: createProductParams){
        let warehouse;
        let id_warehouse_default = 1;
        let newProduct;
        let id = productDetails["id_warehouse"];  

        if('id_warehouse' in productDetails){
            warehouse = await this.warehouseRepository.findOneBy({ id });
            if(!warehouse) warehouse = await this.warehouseRepository.findOneBy({ "id":id_warehouse_default })     
        } else{
            id = id_warehouse_default;
            warehouse = await this.warehouseRepository.findOneBy({ id });
        }
            
        newProduct = this.productRepository.create({...productDetails, created_at: new Date(),})
        const savedProduct =await  this.productRepository.save(newProduct);
        const { cantidad, } = productDetails;
        
        if(savedProduct){
            const inventory = {cantidad, warehouse, product:savedProduct};            
            const createdInventory = await this.inventoryRepository.create([inventory]);  
            const savedInventory = await this.inventoryRepository.save(createdInventory);         
        }
        return savedProduct
    }

    async createInventory(inventoryDetails: createInventorytParams){
        
        const { id_bodega, id_product, cantidad} = inventoryDetails;
        let id = id_product, inventory;
        const product = await this.productRepository.findOneBy({id});
        id = id_bodega;
        const warehouse = await this.warehouseRepository.findOneBy({id});

        if(product && warehouse && cantidad && typeof cantidad === typeof 1 ){
            inventory = await this.inventoryRepository.manager.query
            ( `SELECT inventories.id, cantidad
            FROM inventories
            WHERE id_product = ${id_product} AND id_warehouse = ${id_bodega};            
            `)            
            
            let newinventory;
            if(inventory.length == 1){
                const quantity = cantidad + inventory[0]['cantidad'];
                id = inventory[0]['id'];
                newinventory = await this.inventoryRepository.manager.query
                (`UPDATE inventories
                SET cantidad = ${quantity} 
                WHERE id = ${id} `)
            } else {
                newinventory = await this.inventoryRepository.manager.query
                (`INSERT INTO inventories
                (cantidad, id_warehouse, id_product) VALUES(${cantidad},${id_bodega},${id_product})
                `)
            }
            return newinventory;             
        }
        throw new HttpException(
            "May be something was wrong !!",
            HttpStatus.BAD_REQUEST,
        );  
    }


    async relocateProduct(relocateProduct: relocateProductParams) {
        const { id_bodega_envia, id_bodega_recibe, cantidad, id_producto } = relocateProduct; 
        const exQuery = new ExeQuery()
        const callException = new CallException();       
        
        if(typeof id_bodega_envia == typeof 1 && typeof id_bodega_recibe == typeof 1 &&
            typeof id_bodega_recibe == typeof 1  && typeof cantidad == typeof 1 && id_bodega_envia !== id_bodega_recibe){

            const inventory = await exQuery.getInventory(id_bodega_envia, id_producto, 
                this.inventoryRepository)                        

            const warehouseReceives = await this.warehouseRepository.findOneBy({id:id_bodega_recibe});

            if(inventory.length >=1 && warehouseReceives && cantidad > 0){

                if(inventory[0]['cantidad'] >= cantidad){

                    await exQuery.updateInventoryMinus(inventory, cantidad, this.inventoryRepository.manager)                                        
                    const inventoryToUpdate = await exQuery.getInventory(id_bodega_recibe, id_producto, 
                        this.inventoryRepository)
                    
                    if(inventoryToUpdate.length >=1){

                        const inventory = await exQuery.updateInventorySum(inventoryToUpdate, cantidad, this.inventoryRepository);                       
                        
                        await exQuery.setRecord(cantidad, id_producto, id_bodega_envia, id_bodega_recibe, 
                            inventoryToUpdate[0]['id'], this.recordRepository);
                        return inventory;
                    } else {
                        const inventory = await exQuery.setInventory(cantidad, id_producto, id_bodega_recibe, 
                            this.inventoryRepository)
                        
                        await exQuery.setRecord(cantidad, id_producto, id_bodega_envia, id_bodega_recibe, 
                            inventory["insertId"], this.recordRepository);
                        return inventory
                    }

                } else callException.message("Insufficient amount stored !!");                    
                
            }           
        }
        callException.message("May be something was wrong !!");                
    }
}

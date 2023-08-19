import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection, InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Warehouse } from 'src/typeorm/entities/Warehouse';
import { User } from 'src/typeorm/entities/User';
import { createWarehouseParams, updateWarehouseParams, createProductParams, createInventorytParams } from 'src/types/types';
import { Repository,  } from 'typeorm';
import { Product } from 'src/typeorm/entities/Product';
import { Inventory } from 'src/typeorm/entities/Inventory';
import { DataSource } from 'typeorm';
import { Console } from 'console';




@Injectable()
export class WarehousesService {

    constructor(
        @InjectDataSource() private dataSource: DataSource,
        @InjectRepository(Warehouse) private warehouseRepository: Repository<Warehouse>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Product) private productRepository: Repository<Product>,
        @InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>
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
        //newWarehouse.user = user;       
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
        let id = productDetails["id_warehouse"]
        

        if('id_warehouse' in productDetails){
            warehouse = await this.warehouseRepository.findOneBy({ id } )
            if(!warehouse) warehouse = await this.warehouseRepository.findOneBy({ "id":id_warehouse_default } )            
        } else{
            id = id_warehouse_default
            warehouse = await this.warehouseRepository.findOneBy({id}) 
        }
        
        
            
        newProduct = this.productRepository.create({...productDetails, created_at: new Date(),})
        const savedProduct =await  this.productRepository.save(newProduct);
        const { cantidad, } = productDetails;
        
        if(savedProduct){
            const inventory = {cantidad, warehouse, product:savedProduct};
            console.log("if saved Product",inventory)
            const createdInventory = await this.inventoryRepository.create([inventory]);  
            const savedInventory = await this.inventoryRepository.save(createdInventory);         
        }

        return savedProduct         
        
    }

    async createInventory(inventoryDetails: createInventorytParams){
        
        const { id_warehouse, id_product, cantidad} = inventoryDetails;
        let id = id_product, inventory;
        const product = await this.productRepository.findOneBy({id});
        id = id_warehouse;
        const warehouse = await this.warehouseRepository.findOneBy({id});

        console.log('id_product', id_product, 'id_warehouse', id_warehouse)

        if(product && warehouse && cantidad && typeof cantidad === typeof 1 ){
            inventory = await this.inventoryRepository.manager.query
            ( `SELECT inventories.id, cantidad
            FROM inventories
            WHERE id_product = ${id_product} AND id_warehouse = ${id_warehouse};            
            `)            
            
            let newinventory;
            if(inventory.length == 1){
                const quantity = cantidad + inventory[0]['cantidad'];
                id = inventory[0]['id'];
                console.log(inventory);

                console.log("UPDATE");
                newinventory = await this.inventoryRepository.manager.query
                (`UPDATE inventories
                SET cantidad = ${quantity} 
                WHERE id = ${id} `)
            } else {
                console.log("INSERT INTO");
                newinventory = await this.inventoryRepository.manager.query
                (`INSERT INTO inventories
                (cantidad, id_warehouse, id_product) VALUES(${cantidad},${id_warehouse},${id_product})
                `)
            }

            console.log("new inventory", newinventory);
            return newinventory;           
            
        }

        throw new HttpException(
            "May be something was wrong !!",
            HttpStatus.BAD_REQUEST,
        );
        

    }
}

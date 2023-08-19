import { Column, Entity, JoinColumn, PrimaryGeneratedColumn, ManyToOne, PrimaryColumn, OneToOne } from "typeorm";
import { Warehouse } from "./Warehouse";
import { Product } from "./Product";


@Entity({ name: 'inventories' })
export class Inventory{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "int"})
    cantidad: number;

    @Column()
    created_by: number;

    @Column()
    updated_by: number;

    @Column()
    created_at: Date;

    @Column()
    updated_at: Date;

    @Column()
    deleted_at: Date;

    

    @ManyToOne(() => Product, (product) => product.inventory,) 
    @JoinColumn({
        name: "id_product",
        referencedColumnName: "id",
        foreignKeyConstraintName: "fk_product_id"
    })     
    product: Product;

    @ManyToOne(() => Warehouse, (warehouse) => warehouse.inventory)
    @JoinColumn({
        name: "id_warehouse",
        referencedColumnName: "id",
        foreignKeyConstraintName: "fk_warehouse_id"
    })   
    warehouse: Warehouse;

    
        
    
}
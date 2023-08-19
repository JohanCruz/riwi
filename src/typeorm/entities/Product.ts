import { Column, Entity, JoinTable, PrimaryGeneratedColumn, ManyToMany, OneToMany } from "typeorm";
import { Warehouse } from "./Warehouse";
import { Inventory } from "./Inventory";
import { type } from "os";

@Entity({ name: 'products' })
export class Product{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50})
    nombre: string;
    
    @Column({length: 300})
    descripcion: string;    

    @Column({ default: false })
    estado:  boolean = false;

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
    
    @OneToMany(type => Inventory, inventory => inventory.product)
    inventory: Inventory[];
}
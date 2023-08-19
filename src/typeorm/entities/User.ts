import { Column, Entity, OneToMany, PrimaryGeneratedColumn,  } from "typeorm";
import { Warehouse } from "./Warehouse";

@Entity({ name: 'users' })
export class User{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 50})
    nombre: string;
    
    @Column({length: 200})
    foto: string;    

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

    @OneToMany(() => Warehouse, (warehouse) => warehouse.user )
    warehouses: Warehouse[];

}
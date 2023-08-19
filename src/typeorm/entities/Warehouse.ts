import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, JoinTable, OneToMany  } from "typeorm";
import { User } from "./User";
import { Inventory } from "./Inventory";

@Entity({ name: 'warehouses' })
export class Warehouse{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ubication: string;
    
    @Column()
    description: string;

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

    @ManyToOne( () => User, (user)=> user.warehouses,
    {eager: true, cascade: true})
    @JoinColumn({
        name: "id_responsable",
        referencedColumnName: "id",
        foreignKeyConstraintName: "fk_user_id"
    })   
    user: User;

    @OneToMany(type => Inventory, inventory => inventory.warehouse)
    inventory: Inventory[];
    
}
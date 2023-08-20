import { CallException } from "./exceptions";


export class ExeQuery {

    constructor(){
        
    }

    callException(){
        let callException = new CallException();
        callException.message("Something was wrong");
    }
    

    setRecord(cantidad, id_producto, id_bodega_envia, id_bodega_recibe, inventory, repo){       
        try {
            repo.manager                        
            .query(`INSERT INTO records (cantidad, id_product, id_bodega_origen, 
                    id_bodega_destino, id_inventario)
                    VALUES(${cantidad}, ${id_producto}, ${id_bodega_envia}, ${id_bodega_recibe}, 
                    ${inventory})
                    `)
        } catch (error) {
            this.callException();
        }   
    }

    async setInventory(cantidad, id_producto, id_bodega_recibe, repo){
        try {
            return await repo.manager                        
            .query(`INSERT INTO inventories (cantidad, id_product, id_warehouse)
                                        VALUES(${cantidad}, ${id_producto} , ${id_bodega_recibe})
                                        `)
        } catch (error) {
            this.callException();
        }
    }

    async updateInventorySum(inventoryToUpdate, cantidad, repo){
        try {
            return await repo.manager
                                .query(`UPDATE inventories
                                        SET cantidad = ${inventoryToUpdate[0]['cantidad'] + cantidad}
                                        WHERE id = ${inventoryToUpdate[0]['id']}                
                                        `)
        } catch (error) {
            this.callException();
        }
    }

    async getInventory(id_bodega_recibe, id_producto, repo){
        try {
            return await repo.manager.query(` Select *
            FROM inventories
            WHERE id_warehouse = ${id_bodega_recibe}  AND id_product = ${id_producto}
            `);
        } catch (error) {
            this.callException();
        }
    }

    async updateInventoryMinus(inventory, cantidad, repo){
        try {
            await repo.query(`UPDATE inventories
                            SET cantidad = ${inventory[0]['cantidad'] - cantidad}
                            WHERE id = ${inventory[0]['id']}                
                            `) 
        } catch (error) {
            this.callException();
        }
        
    }

}
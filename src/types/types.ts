export type createWarehouseParams = {
    ubication: string;
    description: string;
    id_responsable: number;
}

export type updateWarehouseParams = {
    ubication: string;
    description: string;
    id_responsable: number;
}

export type createProductParams = {
    nombre: string;
    descripcion: string;
    id_warehouse: number;
    cantidad: number;    
}

export type createInventorytParams = {
    cantidad: number;
    id_warehouse: number;
    id_product: number;
}
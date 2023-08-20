import { Controller, Get, Post, Put,  Delete, Param, Body, Patch} from '@nestjs/common';
import { CreateWarehouseDto } from 'src/warehouses/dtos/createWarehouse.dto'; 
import { UpdateWarehouseDto } from 'src/warehouses/dtos/updateWarehouse.dto';
import { CreateProductDto } from 'src/warehouses/dtos/createProductDto';
import { CreateInventoryDto } from 'src/warehouses/dtos/createInventoryDto';
import { relocateProductDto } from 'src/warehouses/dtos/relocateProductDto';
import { WarehousesService } from 'src/warehouses/service/warehouses/warehouses.service';

@Controller('warehouses')
export class WarehousesController {

    constructor(private warehouseService: WarehousesService ){}
    @Get()
    getAllStores() {
        return this.warehouseService.searchAll();
    }

    @Post('products')
    createProduct(@Body() productDto: CreateProductDto){
        return this.warehouseService.createProduct(productDto);
    }

    @Put('relocate/product')
    relocateProduct(@Body() relocateProductDto: relocateProductDto){
        return this.warehouseService.relocateProduct(relocateProductDto);
    }

    @Post('inventory')
    createInventor(@Body() inventoryDto: CreateInventoryDto){
        return this.warehouseService.createInventory(inventoryDto);
    }
    
    @Post()
    createStore(@Body() warehouseDto: CreateWarehouseDto){
        return this.warehouseService.createStore(warehouseDto);
    }

    @Put(':id')
    async updateStore(
        @Param('id') idStore: number, 
        @Body() warehouseDto: UpdateWarehouseDto
    ) {
        await this.warehouseService.updateStore(idStore, warehouseDto);
    }

    @Delete(':id')
    async deleteStoreById(
        @Param('id') id: number){
        await this.warehouseService.deleteStore(id);
    }

    @Get('products')
    async getAllProducts() {
        return this.warehouseService.searchAllProducts();
    }

    @Get(':id')
    async getStore(@Param('id') idStore: number) {          
        return this.warehouseService.SearchStore(idStore);
    }    

}

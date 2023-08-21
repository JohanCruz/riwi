import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './typeorm/entities/Warehouse';
import { WarehousesModule } from './warehouses/warehouse.module';
import { User } from './typeorm/entities/User';
import { Product } from './typeorm/entities/Product';
import { Inventory } from './typeorm/entities/Inventory';
import { Record } from './typeorm/entities/Record';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'inventory',
      entities: [Warehouse, User, Product, Inventory, Record],
      synchronize: true,
    }),
    WarehousesModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './typeorm/entities/Warehouse';
import { WarehousesModule } from './warehouses/warehouse.module';
import { User } from './typeorm/entities/User';
import { Product } from './typeorm/entities/Product';
import { Inventory } from './typeorm/entities/Inventory';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'inventor',
      entities: [Warehouse, User, Product, Inventory],
      synchronize: true,
    }),
    WarehousesModule,
  ],
})
export class AppModule {}

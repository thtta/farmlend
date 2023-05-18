import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderProduct } from './entities/order-product.entity';
import { ProductModule } from '../product/product.module';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderProduct]),
    ProductModule,
    OrganizationModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}

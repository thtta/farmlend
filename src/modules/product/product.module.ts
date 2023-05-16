import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), OrganizationModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

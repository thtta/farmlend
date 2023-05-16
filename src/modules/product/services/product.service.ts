import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductFactory } from '../factories/product.factory';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { UpdateProductDto } from '../dto/update-product.dto';
import { OrganizationService } from '../../organization/services/organization.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private organizationService: OrganizationService,
  ) {}

  async create(data: CreateProductDto): Promise<Product> {
    const organization = await this.organizationService.findById(
      data.organization_id,
    );

    const product = ProductFactory.create(data);

    product.organization = organization;
    return await this.productRepository.save(product);
  }

  async findAll(options: IPaginationOptions): Promise<Pagination<Product>> {
    return paginate<Product>(this.productRepository, options);
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return product;
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);

    const productUpdate = ProductFactory.update(product, data);

    return await this.productRepository.save(productUpdate);
  }

  async delete(id: number): Promise<void> {
    const product = await this.findById(id);

    await this.productRepository.softDelete(product.id);
  }
}

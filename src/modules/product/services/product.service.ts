import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductFactory } from '../factories/product.factory';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async create(data: CreateProductDto): Promise<Product> {
    const product = ProductFactory.create(data);

    return await this.productRepository.save(product);
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new HttpException('Product not found', 404);
    }

    return product;
  }

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);

    product.category = data.category;
    product.variety = data.variety;
    product.packaging = data.packaging;

    return await this.productRepository.save(product);
  }

  async delete(id: number): Promise<void> {
    const product = await this.findById(id);

    await this.productRepository.softDelete(product.id);

    return;
  }
}

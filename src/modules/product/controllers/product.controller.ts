import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { SuccessResponse } from '../../../globals/utils';
import { CreateProductDto } from '../dto/create-product.dto';
import { FindProductDto } from '../dto/find-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async findAll() {
    const products = await this.productService.findAll();

    return SuccessResponse('Retrieved Products', { products });
  }

  @Post()
  async create(@Body() data: CreateProductDto) {
    const product = await this.productService.create(data);

    return SuccessResponse('Product has been created', product);
  }

  @Get(':id')
  async findById(@Param() param: FindProductDto) {
    const product = await this.productService.findById(param.id);

    return SuccessResponse('Retrieved Product', product);
  }

  @Put(':id')
  async update(@Param() param: FindProductDto, @Body() data: UpdateProductDto) {
    const product = await this.productService.update(param.id, data);

    return SuccessResponse('Product has been updated', product);
  }

  @Delete(':id')
  async delete(@Param() param: FindProductDto) {
    const product = await this.productService.delete(param.id);

    return SuccessResponse('Product has been deleted');
  }
}

import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { SuccessResponse } from '../../../globals/utils';
import { UpdateProductDto } from '../dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() data: CreateProductDto) {
    const product = await this.productService.create(data);

    return SuccessResponse('Product has been created', product);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe)
    perPage = 20,
  ) {
    const { items, meta } = await this.productService.findAll({
      page,
      limit: perPage,
    });

    return SuccessResponse(
      'Retrieved Products',
      {
        products: items,
      },
      meta,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    const product = await this.productService.findById(id);

    return SuccessResponse('Retrieved Product', product);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: UpdateProductDto) {
    const product = await this.productService.update(id, data);

    return SuccessResponse('Product has been updated', product);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.productService.delete(id);

    return SuccessResponse('Product has been deleted');
  }
}

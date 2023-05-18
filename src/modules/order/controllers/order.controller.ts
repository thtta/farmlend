import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { SuccessResponse } from '../../../globals/utils';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() data: CreateOrderDto) {
    const order = await this.orderService.create(data);

    return SuccessResponse('Order has been created', order);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe)
    perPage = 20,
  ) {
    const { items, meta } = await this.orderService.findAll({
      page,
      limit: perPage,
    });

    return SuccessResponse('Retrieved Orders', { orders: items }, meta);
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    const order = await this.orderService.findById(id);

    return SuccessResponse('Retrieved Order', order);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: UpdateOrderDto) {
    const order = await this.orderService.update(id, data);

    return SuccessResponse('Order has been updated', order);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.orderService.delete(id);

    return SuccessResponse('Order has been deleted');
  }
}

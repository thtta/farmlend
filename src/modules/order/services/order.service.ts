import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto, OrderProductDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../entities/order.entity';
import { In, Repository } from 'typeorm';
import { ProductService } from '../../product/services/product.service';
import { OrderProduct } from '../entities/order-product.entity';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { OrganizationService } from '../../organization/services/organization.service';
import { OrderFactory } from '../factories/order.factory';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private productService: ProductService,
    private organizationService: OrganizationService,
  ) {}

  async create(data: CreateOrderDto): Promise<Order> {
    const { type } = data;

    const organization = await this.organizationService.findById(
      data.organization_id,
    );

    const orders = await this.getOrders(data.orders || []);
    const products = await this.getProducts(data.products || []);

    const order = OrderFactory.create({
      type,
      orders,
      products,
      organization,
    });

    return await this.orderRepository.save(order);
  }

  async getOrders(orders: number[]): Promise<Order[]> {
    const repoOrders = await this.orderRepository.find({
      where: {
        id: In(orders),
      },
    });

    // If this occurs, user has passed in an invalid order id
    if (repoOrders.length != orders.length) {
      throw new HttpException('Invalid Order ID', HttpStatus.BAD_REQUEST);
    }

    return repoOrders;
  }

  async getProducts(products: OrderProductDto[]): Promise<OrderProduct[]> {
    // Fetch all the product IDs
    const productIDs = products.map((product) => product.product_id);
    const repoProducts = await this.productService.findByIds(productIDs);

    // If this occurs, user has passed in an invalid product id
    if (repoProducts.length != productIDs.length) {
      throw new HttpException('Invalid Product ID', HttpStatus.BAD_REQUEST);
    }

    const lookupRepoProducts = {};

    for (const product of repoProducts) {
      lookupRepoProducts[product.id] = product;
    }

    const orderProducts: OrderProduct[] = [];
    for (const product of products) {
      const order = new OrderProduct(
        product.volume,
        product.price_per_unit,
        lookupRepoProducts[product.product_id],
      );
      orderProducts.push(order);
    }

    return orderProducts;
  }

  findAll(options: IPaginationOptions): Promise<Pagination<Order>> {
    return paginate<Order>(this.orderRepository, options);
  }

  async findById(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        referencedOrders: true,
        products: true,
      },
    });
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  async update(id: number, data: UpdateOrderDto): Promise<Order> {
    const { type } = data;
    const order = await this.findById(id);

    if ((data.orders || []).includes(id)) {
      throw new HttpException(
        'An order cannot reference itself',
        HttpStatus.BAD_REQUEST,
      );
    }

    const orders = await this.getOrders(data.orders || []);
    const products = await this.getProducts(data.products || []);

    const orderUpdate = OrderFactory.update(order, {
      type,
      orders,
      products,
    });

    return await this.orderRepository.save(orderUpdate);
  }

  async delete(id: number): Promise<void> {
    const order = await this.findById(id);

    await this.orderRepository.softDelete(order.id);
  }
}

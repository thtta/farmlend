import { Order } from '../entities/order.entity';
import { OrderDto } from '../interfaces';

export class OrderFactory {
  static create(data: OrderDto) {
    const order = new Order();

    order.type = data.type;
    order.referencedOrders = data.orders;
    order.products = data.products;
    order.organization = data.organization;

    return order;
  }

  static update(order: Order, data: OrderDto) {
    order.type = data.type;
    order.referencedOrders = data.orders;
    order.products = data.products;

    return order;
  }
}

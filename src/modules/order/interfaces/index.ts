import { Order } from '../entities/order.entity';
import { OrderProduct } from '../entities/order-product.entity';
import { Organization } from '../../organization/entities/organization.entity';

interface OrderDto {
  type: string;
  orders: Order[];
  products: OrderProduct[];
  organization?: Organization;
}

export { OrderDto };

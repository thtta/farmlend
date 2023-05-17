import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Order } from './order.entity';

@Entity('order_products')
export class OrderProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  volume: string;

  @Column()
  price_per_unit: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Product, (product) => product.orders, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Order, (order) => order.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  constructor(volume: string, pricePerUnit: string, product: Product) {
    this.volume = volume;
    this.price_per_unit = pricePerUnit;
    this.product = product;
  }
}

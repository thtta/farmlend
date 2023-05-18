import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { OrderProduct } from './order-product.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Organization, (organization) => organization.orders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @ManyToMany(() => Order, { cascade: ['insert', 'update'] })
  @JoinTable({ name: 'referenced_orders', joinColumn: { name: 'orders_id_1' } })
  referencedOrders: Order[];

  @OneToMany(() => OrderProduct, (product) => product.order, {
    cascade: ['insert', 'update', 'soft-remove'],
  })
  products: OrderProduct[];
}

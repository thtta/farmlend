import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { OrderProduct } from '../../order/entities/order-product.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string;

  @Column()
  variety: string;

  @Column()
  packaging: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @ManyToOne(() => Organization, (organization) => organization.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => OrderProduct, (order) => order.product)
  orders: OrderProduct[];

  constructor(category: string, variety: string, packaging: string) {
    this.category = category;
    this.variety = variety;
    this.packaging = packaging;
  }
}

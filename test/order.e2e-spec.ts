import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { Organization } from '../src/modules/organization/entities/organization.entity';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { OrganizationType } from '../src/modules/organization/enums';
import { Product } from '../src/modules/product/entities/product.entity';
import { Order } from '../src/modules/order/entities/order.entity';
import { OrderFactory } from '../src/modules/order/factories/order.factory';
import { OrderType } from '../src/modules/order/enums';
import { OrderProduct } from '../src/modules/order/entities/order-product.entity';

let product = new Product('Apples', 'Golden', '18KG Boxes');
let organization = new Organization('test-org', OrganizationType.BUYER);
const orderProduct = new OrderProduct('100KG', '1.5USD/1KG', product);
let order = OrderFactory.create({
  type: OrderType.BUY,
  orders: [],
  products: [orderProduct],
  organization,
});

describe('Orders', () => {
  let app: NestFastifyApplication;
  let repository: Repository<Order>;
  let productRepository: Repository<Product>;
  let organizationRepository: Repository<Organization>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: true }),
    );

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    repository = module.get('OrderRepository');
    productRepository = module.get('ProductRepository');
    organizationRepository = module.get('OrganizationRepository');

    app.setGlobalPrefix('api');

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    organization = await organizationRepository.save(organization);
    product.organization = organization;
    product = await productRepository.save(product);
    order = await repository.save(order);
  });

  afterEach(async () => {
    await repository.delete({});
    await productRepository.delete({});
    await organizationRepository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /orders', () => {
    it('should return an array of orders', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/api/orders')
        .expect(HttpStatus.OK);

      expect(body.data.orders.length).toEqual(1);
      expect(body.data.orders[0].type).toEqual(order.type);
    });
  });

  describe('POST /orders', () => {
    it('can create an order', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          type: OrderType.BUY,
          products: [
            {
              product_id: product.id,
              volume: '100KG',
              price_per_unit: '1.5USD/1KG',
            },
          ],
          organization_id: organization.id,
        })
        .expect(HttpStatus.CREATED);

      expect(body.data.type).toEqual(order.type);
      expect(typeof body.data).toBe('object');
    });

    it('can create and reference other orders', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          type: OrderType.BUY,
          orders: [order.id],
          products: [
            {
              product_id: product.id,
              volume: '100KG',
              price_per_unit: '1.5USD/1KG',
            },
          ],
          organization_id: organization.id,
        })
        .expect(HttpStatus.CREATED);

      expect(body.data.type).toEqual(order.type);
      expect(body.data.referencedOrders[0].id).toEqual(order.id);
      expect(typeof body.data).toBe('object');
    });

    it('does not create an order without a type field', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          products: [
            {
              product_id: product.id,
              volume: '100KG',
              price_per_unit: '1.5USD/1KG',
            },
          ],
          organization_id: organization.id,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('does not create an order with invalid referenced orders', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          type: OrderType.BUY,
          orders: [400, 200],
          products: [
            {
              product_id: product.id,
              volume: '100KG',
              price_per_unit: '1.5USD/1KG',
            },
          ],
          organization_id: organization.id,
        });
    });

    it('does not create an order with invalid product id', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          type: OrderType.BUY,
          products: [
            {
              product_id: 1000,
              volume: '100KG',
              price_per_unit: '1.5USD/1KG',
            },
          ],
          organization_id: organization.id,
        });
    });

    it('does not create an order with an invalid organization id', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          type: OrderType.BUY,
          products: [
            {
              product_id: product.id,
              volume: '100KG',
              price_per_unit: '1.5USD/1KG',
            },
          ],
          organization_id: 1000,
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /order', () => {
    it('can get an order', async () => {
      const { id, type } = await repository.save(order);
      const { body } = await request(app.getHttpServer())
        .get(`/api/orders/${id}`)
        .expect(HttpStatus.OK);

      expect(body.data.id).toEqual(id);
      expect(body.data.type).toEqual(type);
    });

    it('should return 404 for an invalid order', async () => {
      await request(app.getHttpServer())
        .get(`/api/orders/1`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('UPDATE /order', () => {
    it('can update an order', async () => {
      const data = {
        type: OrderType.BUY,
        products: [
          {
            product_id: product.id,
            volume: '100KG',
            price_per_unit: '1.5USD/1KG',
          },
        ],
        organization_id: organization.id,
      };
      const { body } = await request(app.getHttpServer())
        .put(`/api/orders/${order.id}`)
        .send(data)
        .expect(HttpStatus.OK);

      expect(body.data.type).toEqual(data.type);
      expect(body.data.products[0].product?.id).toEqual(
        data.products[0].product_id,
      );
    });

    it('should throw an exception when an order tries to reference itself', async () => {
      const { id } = await repository.save(order);
      const data = {
        type: OrderType.BUY,
        orders: [id],
        products: [
          {
            product_id: product.id,
            volume: '100KG',
            price_per_unit: '1.5USD/1KG',
          },
        ],
        organization_id: organization.id,
      };

      await request(app.getHttpServer())
        .put(`/api/orders/${id}`)
        .send(data)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /order', () => {
    it('can delete an order', async () => {
      const { id } = await repository.save(order);
      await request(app.getHttpServer())
        .delete(`/api/orders/${id}`)
        .expect(HttpStatus.OK);

      await expect(repository.findAndCount()).resolves.toEqual([[], 0]);
    });
  });
});

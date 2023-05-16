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

const product = new Product('Apples', 'Golden', '18KG Boxes');
let organization = new Organization('test-org', OrganizationType.BUYER);

describe('Products', () => {
  let app: NestFastifyApplication;
  let repository: Repository<Product>;
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
    repository = module.get('ProductRepository');
    organizationRepository = module.get('OrganizationRepository');

    app.setGlobalPrefix('api');

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(async () => {
    organization = await organizationRepository.save(organization);
    product.organization = organization;
  });

  afterEach(async () => {
    await organizationRepository.delete({});
    await repository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('should return an array of products', async () => {
      await repository.save(product);

      const { body } = await request(app.getHttpServer())
        .get('/api/products')
        .expect(HttpStatus.OK);

      expect(body.data.products.length).toEqual(1);
      expect(body.data.products[0].category).toEqual(product.category);
      expect(body.data.products[0].variety).toEqual(product.variety);
    });
  });

  describe('POST /products', () => {
    it('can create a product', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/api/products')
        .send({
          category: product.category,
          variety: product.variety,
          packaging: product.packaging,
          organization_id: organization.id,
        })
        .expect(HttpStatus.CREATED);

      expect(body.data.category).toEqual(product.category);
      expect(body.data.variety).toEqual(product.variety);
      expect(body.data.packaging).toEqual(product.packaging);
    });

    it('does not create a product without a category field', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .send({
          variety: product.variety,
          packaging: product.packaging,
          organization_id: organization.id,
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('does not create a product with an invalid organization id', async () => {
      await request(app.getHttpServer())
        .post('/api/products')
        .send({
          category: product.category,
          variety: product.variety,
          packaging: product.packaging,
          organization_id: 55,
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /product', () => {
    it('can get a product', async () => {
      const { id, category, variety } = await repository.save(product);
      const { body } = await request(app.getHttpServer())
        .get(`/api/products/${id}`)
        .expect(HttpStatus.OK);

      expect(body.data.id).toEqual(id);
      expect(body.data.category).toEqual(category);
      expect(body.data.variety).toEqual(variety);
    });

    it('should return 404 for an invalid product', async () => {
      await request(app.getHttpServer())
        .get(`/api/products/1`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('UPDATE /product', () => {
    it('can update a product', async () => {
      const { id } = await repository.save(product);
      const data = {
        category: 'updated-test-category',
        variety: 'updated-test-variety',
        packaging: 'updated-test-packaging',
      };
      const { body } = await request(app.getHttpServer())
        .put(`/api/products/${id}`)
        .send(data)
        .expect(HttpStatus.OK);

      expect(body.data.category).toEqual(data.category);
      expect(body.data.variety).toEqual(data.variety);
      expect(body.data.packaging).toEqual(data.packaging);
    });
  });

  describe('DELETE /product', () => {
    it('can delete a product', async () => {
      const { id } = await repository.save(product);
      await request(app.getHttpServer())
        .delete(`/api/products/${id}`)
        .expect(HttpStatus.OK);

      await expect(repository.findAndCount()).resolves.toEqual([[], 0]);
    });
  });
});

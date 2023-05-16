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

const organization = new Organization('test-org', OrganizationType.BUYER);
describe('Organizations', () => {
  let app: NestFastifyApplication;
  let repository: Repository<Organization>;

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
    repository = module.get('OrganizationRepository');

    app.setGlobalPrefix('api');

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await repository.delete({});
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /organizations', () => {
    it('should return an array of organizations', async () => {
      await repository.save(organization);

      const { body } = await request(app.getHttpServer())
        .get('/api/organizations')
        .expect(HttpStatus.OK);

      expect(body.data.organizations.length).toEqual(1);
      expect(body.data.organizations[0].name).toEqual(organization.name);
    });
  });

  describe('POST /organizations', () => {
    it('can create an organization', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/api/organizations')
        .send({ name: 'test-org', type: OrganizationType.BUYER })
        .expect(HttpStatus.CREATED);

      expect(body.data.name).toEqual(organization.name);
      expect(body.data.type).toEqual(organization.type);
    });

    it('does not create an organization without a name field', async () => {
      await request(app.getHttpServer())
        .post('/api/organizations')
        .send({ type: OrganizationType.BUYER })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('does not create an organization with an invalid organization type', async () => {
      await request(app.getHttpServer())
        .post('/api/organizations')
        .send({ name: 'test-org', type: 'invalid' })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /organization', () => {
    it('can get an organization', async () => {
      const { id, name, type } = await repository.save(organization);
      const { body } = await request(app.getHttpServer())
        .get(`/api/organizations/${id}`)
        .expect(HttpStatus.OK);

      expect(body.data.id).toEqual(id);
      expect(body.data.name).toEqual(name);
      expect(body.data.type).toEqual(type);
    });

    it('should return 404 for an invalid organization', async () => {
      await request(app.getHttpServer())
        .get(`/api/organizations/1`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('UPDATE /organization', () => {
    it('can update an organization', async () => {
      const { id } = await repository.save(organization);
      const data = { name: 'updated-test-org', type: OrganizationType.SELLER };
      const { body } = await request(app.getHttpServer())
        .put(`/api/organizations/${id}`)
        .send(data)
        .expect(HttpStatus.OK);

      expect(body.data.name).toEqual(data.name);
      expect(body.data.type).toEqual(data.type);
    });
  });

  describe('DELETE /organization', () => {
    it('can delete an organization', async () => {
      const { id } = await repository.save(organization);
      await request(app.getHttpServer())
        .delete(`/api/organizations/${id}`)
        .expect(HttpStatus.OK);

      await expect(repository.findAndCount()).resolves.toEqual([[], 0]);
    });
  });
});

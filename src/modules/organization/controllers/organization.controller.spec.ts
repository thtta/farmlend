import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { Organization } from '../entities/organization.entity';
import { OrganizationType } from '../enums';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

const testOrganization = 'Test Organization';
const organizationType = OrganizationType.BUYER;
const organization = new Organization(testOrganization, organizationType);

const organizationResults = {
  items: [
    organization,
    new Organization('test-organization-1', OrganizationType.BUYER),
    new Organization('test-organization-2', OrganizationType.SELLER),
  ],
  meta: {
    itemCount: 3,
    totalItems: 3,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  },
};

describe('OrganizationController', () => {
  let controller: OrganizationController;
  let service: OrganizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationController],
      providers: [
        {
          provide: OrganizationService,
          useValue: {
            create: jest.fn().mockResolvedValue(organization),
            findAll: jest.fn().mockResolvedValue(organizationResults),
            findById: jest.fn().mockResolvedValue(organization),
            update: jest.fn().mockResolvedValue(organization),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<OrganizationController>(OrganizationController);
    service = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an organization', async () => {
      const createDto: CreateOrganizationDto = {
        name: testOrganization,
        type: organizationType,
      };

      const { data } = await controller.create(createDto);
      expect(data).toEqual(organization);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(typeof data).toBe('object');
    });
  });

  describe('findAll', () => {
    it('should find all organizations with pagination', async () => {
      const { data, meta } = await controller.findAll(1, 10);
      expect(data['organizations']).toEqual(organizationResults.items);
      expect(meta).toEqual(organizationResults.meta);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(service.findAll).toBeCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should find an organization by id', async () => {
      const id = 1;
      const { data } = await controller.findById(id);
      expect(data).toEqual(organization);
      expect(service.findById).toHaveBeenCalledWith(id);
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(typeof data).toBe('object');
    });
  });

  describe('update', () => {
    it('should update an organization by id', async () => {
      const id = 1;
      const updateDto: UpdateOrganizationDto = {
        name: testOrganization,
        type: organizationType,
      };

      const { data } = await controller.update(id, updateDto);
      expect(data).toEqual(organization);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(typeof data).toBe('object');
    });
  });

  describe('delete', () => {
    it('should delete an organization by id', async () => {
      const id = 1;
      await controller.delete(id);

      expect(service.delete).toHaveBeenCalledWith(id);
      expect(service.delete).toHaveBeenCalledTimes(1);
    });
  });
});

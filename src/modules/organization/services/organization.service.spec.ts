import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { OrganizationType } from '../enums';
import { HttpException } from '@nestjs/common';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

jest.mock('nestjs-typeorm-paginate', () => {
  return {
    paginate: jest.fn().mockResolvedValue({
      items: [
        {
          name: 'test-organization-1',
          type: 'seller',
        },

        {
          name: 'test-organization-2',
          type: 'buyer',
        },
      ],
      meta: {
        itemCount: 2,
        totalItems: 2,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    }),
  };
});

const testOrganization = 'Test Organization';
const organizationType = OrganizationType.BUYER;
const organization = new Organization(testOrganization, organizationType);

describe('OrganizationService', () => {
  let service: OrganizationService;
  let repository: Repository<Organization>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            findOne: jest.fn().mockResolvedValue(organization),
            save: jest.fn().mockResolvedValue(organization),
            softDelete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    repository = module.get<Repository<Organization>>(
      getRepositoryToken(Organization),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an organization', async () => {
      const createDto: CreateOrganizationDto = {
        name: testOrganization,
        type: OrganizationType.BUYER,
      };

      const result = await service.create(createDto);
      expect(result).toEqual(organization);
      expect(repository.save).toBeCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of organizations with pagination', async () => {
      const result = await service.findAll({ limit: 10, page: 1 });

      expect(result.items.length).toEqual(2);
      expect(result.items[0].name).toEqual('test-organization-1');
      expect(result.items[0].type).toEqual(OrganizationType.SELLER);

      expect(result.meta.itemCount).toEqual(2);
      expect(result.meta.itemsPerPage).toEqual(10);
    });
  });

  describe('findById', () => {
    it('should find an organization by ID', async () => {
      const id = 1;
      const result = await service.findById(id);
      expect(result).toEqual(organization);
      expect(repository.findOne).toBeCalledTimes(1);
    });

    it('should throw an exception when an organization is not found', async () => {
      const id = 1;
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findById(id)).rejects.toThrow(HttpException);
      expect(repository.findOne).toBeCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update an organization', async () => {
      const id = 1;
      const updateDto: UpdateOrganizationDto = {
        name: testOrganization,
        type: OrganizationType.BUYER,
      };

      const result = await service.update(id, updateDto);
      expect(result).toEqual(organization);

      expect(repository.findOne).toBeCalledTimes(1);
      expect(repository.save).toBeCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete an organization', async () => {
      const id = 1;

      await service.delete(id);

      expect(repository.findOne).toBeCalledTimes(1);
      expect(repository.softDelete).toBeCalledTimes(1);
    });
  });
});

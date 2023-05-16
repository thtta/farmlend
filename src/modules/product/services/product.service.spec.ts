import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { OrganizationType } from '../../organization/enums';
import { HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganizationService } from '../../organization/services/organization.service';
import { Organization } from '../../organization/entities/organization.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

jest.mock('nestjs-typeorm-paginate', () => {
  return {
    paginate: jest.fn().mockResolvedValue({
      items: [
        {
          category: 'apples',
          variety: 'golden',
          packaging: '18KG Boxes',
          organization_id: 1,
        },

        {
          category: 'bananas',
          variety: 'gala',
          packaging: '20KG mesh bags',
          organization_id: 1,
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

const productCategory = 'Apples';
const productVariety = 'Golden';
const productPackaging = '18KG Boxes';
const product = new Product(productCategory, productVariety, productPackaging);
const organization = new Organization('test-org-1', OrganizationType.BUYER);

describe('ProductService', () => {
  let service: ProductService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: OrganizationService,
          useValue: {
            findById: jest.fn().mockResolvedValue(organization),
          },
        },
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(product),
            save: jest.fn().mockResolvedValue(product),
            softDelete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a product', async () => {
      const createDto: CreateProductDto = {
        category: productCategory,
        variety: productVariety,
        packaging: productPackaging,
        organization_id: 1,
      };

      const result = await service.create(createDto);
      expect(result).toEqual(product);
      expect(repository.save).toBeCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of products with pagination', async () => {
      const result = await service.findAll({ limit: 10, page: 1 });

      expect(result.items.length).toEqual(2);
      expect(result.items[0].category).toEqual('apples');
      expect(result.items[0].variety).toEqual('golden');

      expect(result.meta.itemCount).toEqual(2);
      expect(result.meta.itemsPerPage).toEqual(10);
    });
  });

  describe('findById', () => {
    it('should find a product by ID', async () => {
      const id = 1;
      const result = await service.findById(id);
      expect(result).toEqual(product);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
      expect(repository.findOneBy).toBeCalledTimes(1);
    });

    it('should throw an exception when a product is not found', async () => {
      const id = 1;
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.findById(id)).rejects.toThrow(HttpException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
      expect(repository.findOneBy).toBeCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const id = 1;
      const updateDto: UpdateProductDto = {
        category: productCategory,
        variety: productVariety,
        packaging: productPackaging,
      };

      const result = await service.update(id, updateDto);
      expect(result).toEqual(product);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
      expect(repository.findOneBy).toBeCalledTimes(1);
      expect(repository.save).toBeCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const id = 1;

      await service.delete(id);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id });
      expect(repository.findOneBy).toBeCalledTimes(1);
      expect(repository.softDelete).toBeCalledTimes(1);
    });
  });
});

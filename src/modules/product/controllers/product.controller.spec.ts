import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from '../services/product.service';
import { Product } from '../entities/product.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { OrganizationType } from '../../organization/enums';
import { OrganizationService } from '../../organization/services/organization.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

const productCategory = 'Apples';
const productVariety = 'Golden';
const productPackaging = '18KG Boxes';
const product = new Product(productCategory, productVariety, productPackaging);
const organization = new Organization('test-org-1', OrganizationType.BUYER);

const productResults = {
  items: [
    product,
    new Product('test-product-1', 'Gala', '20KG mesh'),
    new Product('test-product-2', 'Golden', '18KG Boxes'),
  ],
  meta: {
    itemCount: 3,
    totalItems: 3,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  },
};

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn().mockResolvedValue(product),
            findAll: jest.fn().mockResolvedValue(productResults),
            findById: jest.fn().mockResolvedValue(product),
            update: jest.fn().mockResolvedValue(product),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: OrganizationService,
          useValue: {
            findById: jest.fn().mockResolvedValue(organization),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto: CreateProductDto = {
        category: productCategory,
        packaging: productPackaging,
        variety: productVariety,
        organization_id: 1,
      };

      const { data } = await controller.create(createDto);
      expect(data).toEqual(product);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(typeof data).toBe('object');
    });
  });

  describe('findAll', () => {
    it('should find all products with pagination', async () => {
      const { data, meta } = await controller.findAll(1, 10);
      expect(data['products']).toEqual(productResults.items);
      expect(meta).toEqual(productResults.meta);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(service.findAll).toBeCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should find a product by id', async () => {
      const id = 1;
      const { data } = await controller.findById(id);
      expect(data).toEqual(product);
      expect(service.findById).toHaveBeenCalledWith(id);
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(typeof data).toBe('object');
    });
  });

  describe('update', () => {
    it('should update a product by id', async () => {
      const id = 1;
      const updateDto: UpdateProductDto = {
        category: productCategory,
        variety: productVariety,
        packaging: productPackaging,
      };

      const { data } = await controller.update(id, updateDto);
      expect(data).toEqual(product);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(typeof data).toBe('object');
    });
  });

  describe('delete', () => {
    it('should delete a product by id', async () => {
      const id = 1;
      await controller.delete(id);

      expect(service.delete).toHaveBeenCalledWith(id);
      expect(service.delete).toHaveBeenCalledTimes(1);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { HttpException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderType } from '../enums';
import { Organization } from '../../organization/entities/organization.entity';
import { OrganizationType } from '../../organization/enums';
import { OrderFactory } from '../factories/order.factory';
import { OrderProduct } from '../entities/order-product.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductService } from '../../product/services/product.service';
import { OrganizationService } from '../../organization/services/organization.service';
import { UpdateOrderDto } from '../dto/update-order.dto';

jest.mock('nestjs-typeorm-paginate', () => {
  return {
    paginate: jest.fn().mockResolvedValue({
      items: [
        {
          id: 1,
          type: 'sell',
        },

        {
          id: 2,
          type: 'buy',
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

const organization = new Organization('test-org-1', OrganizationType.BUYER);
const product = new Product('Apples', 'Gala', '18KG Boxes');
const orderProduct = new OrderProduct('100KG', '1.5USD/1KG', product);
const order = OrderFactory.create({
  type: OrderType.BUY,
  orders: [],
  products: [orderProduct],
  organization,
});

describe('OrderService', () => {
  let service: OrderService;
  let repository: Repository<Order>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn().mockResolvedValue(order),
            save: jest.fn().mockResolvedValue(order),
            softDelete: jest.fn().mockResolvedValue(true),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: ProductService,
          useValue: {
            findByIds: jest.fn().mockResolvedValue([product]),
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

    service = module.get<OrderService>(OrderService);
    repository = module.get<Repository<Order>>(getRepositoryToken(Order));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an order', async () => {
      const createDto: CreateOrderDto = {
        type: OrderType.BUY,
        products: [
          {
            product_id: 1,
            volume: '100KG',
            price_per_unit: '1.5USD/1KG',
          },
        ],
        organization_id: 1,
      };

      const result = await service.create(createDto);
      expect(result).toEqual(order);
      expect(repository.save).toBeCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of orders with pagination', async () => {
      const result = await service.findAll({ limit: 10, page: 1 });

      expect(result.items.length).toEqual(2);
      expect(result.items[0].id).toEqual(1);
      expect(result.items[0].type).toEqual('sell');

      expect(result.meta.itemCount).toEqual(2);
      expect(result.meta.itemsPerPage).toEqual(10);
    });
  });

  describe('findById', () => {
    it('should find an order by ID', async () => {
      const id = 1;
      const result = await service.findById(id);
      expect(result).toEqual(order);
      expect(repository.findOne).toBeCalledTimes(1);
    });

    it('should throw an exception when an order is not found', async () => {
      const id = 1;
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      await expect(service.findById(id)).rejects.toThrow(HttpException);
      expect(repository.findOne).toBeCalledTimes(1);
    });
  });
  //
  describe('update', () => {
    it('should update an order', async () => {
      const id = 1;
      const updateDto: UpdateOrderDto = {
        type: OrderType.BUY,
        products: [
          {
            product_id: 1,
            volume: '100KG',
            price_per_unit: '1.5USD/1KG',
          },
        ],
      };

      const result = await service.update(id, updateDto);
      expect(result).toEqual(order);
      expect(repository.findOne).toBeCalledTimes(1);
      expect(repository.save).toBeCalledTimes(1);
    });

    it('should throw an exception when an order tries to reference itself', async () => {
      const id = 1;
      const updateDto: UpdateOrderDto = {
        type: OrderType.BUY,
        orders: [1],
        products: [
          {
            product_id: 1,
            volume: '100KG',
            price_per_unit: '1.5USD/1KG',
          },
        ],
      };

      await expect(service.update(id, updateDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('delete', () => {
    it('should delete an order', async () => {
      const id = 1;

      await service.delete(id);
      expect(repository.findOne).toBeCalledTimes(1);
      expect(repository.softDelete).toBeCalledTimes(1);
    });
  });
});

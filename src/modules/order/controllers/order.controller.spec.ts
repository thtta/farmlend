import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderType } from '../enums';
import { Organization } from '../../organization/entities/organization.entity';
import { OrganizationType } from '../../organization/enums';
import { Product } from '../../product/entities/product.entity';
import { OrderProduct } from '../entities/order-product.entity';
import { OrderFactory } from '../factories/order.factory';
import { OrganizationService } from '../../organization/services/organization.service';
import { UpdateOrderDto } from '../dto/update-order.dto';

const organization = new Organization('test-org-1', OrganizationType.BUYER);
const product = new Product('Apples', 'Gala', '18KG Boxes');
const orderProduct = new OrderProduct('100KG', '1.5USD/1KG', product);
const order = OrderFactory.create({
  type: OrderType.BUY,
  orders: [],
  products: [orderProduct],
  organization,
});

const orderResults = {
  items: [
    order,
    OrderFactory.create({
      type: OrderType.SELL,
      orders: [],
      products: [orderProduct],
      organization,
    }),
    OrderFactory.create({
      type: OrderType.BUY,
      orders: [],
      products: [orderProduct],
      organization,
    }),
  ],
  meta: {
    itemCount: 3,
    totalItems: 3,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  },
};

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            create: jest.fn().mockResolvedValue(order),
            findAll: jest.fn().mockResolvedValue(orderResults),
            findById: jest.fn().mockResolvedValue(order),
            update: jest.fn().mockResolvedValue(order),
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

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
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

      const { data } = await controller.create(createDto);
      expect(data).toEqual(order);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(typeof data).toBe('object');
    });
  });

  describe('findAll', () => {
    it('should find all orders with pagination', async () => {
      const { data, meta } = await controller.findAll(1, 10);
      expect(data['orders']).toEqual(orderResults.items);
      expect(meta).toEqual(orderResults.meta);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(service.findAll).toBeCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should find an order by id', async () => {
      const id = 1;
      const { data } = await controller.findById(id);
      expect(data).toEqual(order);
      expect(service.findById).toHaveBeenCalledWith(id);
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(typeof data).toBe('object');
    });
  });

  describe('update', () => {
    it('should update an order by id', async () => {
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

      const { data } = await controller.update(id, updateDto);
      expect(data).toEqual(order);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(typeof data).toBe('object');
    });
  });

  describe('delete', () => {
    it('should delete an order by id', async () => {
      const id = 1;
      await controller.delete(id);

      expect(service.delete).toHaveBeenCalledWith(id);
      expect(service.delete).toHaveBeenCalledTimes(1);
    });
  });
});

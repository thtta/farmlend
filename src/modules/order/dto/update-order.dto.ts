import { OmitType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends OmitType(CreateOrderDto, [
  'organization_id',
] as const) {}

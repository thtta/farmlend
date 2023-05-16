import { CreateProductDto } from './create-product.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateProductDto extends OmitType(CreateProductDto, [
  'organization_id',
] as const) {}

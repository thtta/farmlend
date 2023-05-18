import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../enums';

export class CreateOrderDto {
  @IsString()
  @IsIn([OrderType.BUY, OrderType.SELL])
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  organization_id: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  orders?: number[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  @IsNotEmpty()
  products?: OrderProductDto[];
}

export class OrderProductDto {
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @IsString()
  @IsNotEmpty()
  volume: string;

  @IsString()
  @IsNotEmpty()
  price_per_unit: string;
}

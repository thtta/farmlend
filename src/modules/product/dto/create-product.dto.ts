import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateProductDto {
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  category: string;

  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  variety: string;

  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  packaging: string;

  @IsNumber()
  @IsNotEmpty()
  organization_id: number;
}

import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { OrganizationType } from '../enums';

export class CreateOrganizationDto {
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn([OrganizationType.BUYER, OrganizationType.SELLER])
  @IsString()
  @IsOptional()
  type: string;
}

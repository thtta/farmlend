import { IsNumber } from 'class-validator';

export class FindOrganizationDto {
  @IsNumber()
  id: number;
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { SuccessResponse } from '../../../globals/utils';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  async create(@Body() data: CreateOrganizationDto) {
    const organization = await this.organizationService.create(data);

    return SuccessResponse('Organization has been created', organization);
  }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe)
    perPage = 20,
  ) {
    const { items, meta } = await this.organizationService.findAll({
      page,
      limit: perPage,
    });

    return SuccessResponse(
      'Retrieved Organizations',
      {
        organizations: items,
      },
      meta,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    const organization = await this.organizationService.findById(id);

    return SuccessResponse('Retrieved Organization', organization);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: UpdateOrganizationDto) {
    const organization = await this.organizationService.update(id, data);

    return SuccessResponse('Organization has been updated', organization);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.organizationService.delete(id);

    return SuccessResponse('Organization has been deleted');
  }
}

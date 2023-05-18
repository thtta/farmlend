import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from '../entities/organization.entity';
import { Repository } from 'typeorm';
import { OrganizationFactory } from '../factories/organization.factory';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async create(data: CreateOrganizationDto): Promise<Organization> {
    const organization = OrganizationFactory.create(data);

    return await this.organizationRepository.save(organization);
  }

  async findAll(
    options: IPaginationOptions,
  ): Promise<Pagination<Organization>> {
    return paginate<Organization>(this.organizationRepository, options);
  }

  async findById(id: number): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        products: true,
        orders: true
      }
    });
    if (!organization) {
      throw new HttpException('Organization not found', HttpStatus.NOT_FOUND);
    }

    return organization;
  }

  async update(id: number, data: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findById(id);

    const organizationUpdate = OrganizationFactory.update(organization, data);

    return await this.organizationRepository.save(organizationUpdate);
  }

  async delete(id: number): Promise<void> {
    const organization = await this.findById(id);

    await this.organizationRepository.softDelete(organization.id);
  }
}

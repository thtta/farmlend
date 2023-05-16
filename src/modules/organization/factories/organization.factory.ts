import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { Organization } from '../entities/organization.entity';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

export class OrganizationFactory {
  static create(data: CreateOrganizationDto) {
    const organization = new Organization(data.name, data.type);
    return organization;
  }

  static update(organization: Organization, data: UpdateOrganizationDto) {
    organization.name = data.name;
    organization.type = data.type;

    return organization;
  }
}

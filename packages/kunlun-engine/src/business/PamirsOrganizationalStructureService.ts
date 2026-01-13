import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { TreeModelApi } from '../service';
import { PamirsDepartment, PamirsOrganizationalStructure } from '../typing';
import { DepartmentQueryFilter } from './PamirsDepartmentService';

export interface OrganizationalStructureQueryFilter extends DepartmentQueryFilter {
  companyModel?: string;
}

export interface PamirsOrganizationalStructureService extends TreeModelApi<PamirsOrganizationalStructure> {
  queryListByFilter(query: OrganizationalStructureQueryFilter): Promise<PamirsDepartment[]>;
}

export const PamirsOrganizationalStructureServiceToken = ServiceIdentifier<PamirsOrganizationalStructureService>(
  'PamirsOrganizationalStructure'
);

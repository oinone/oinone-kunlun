import { ServiceIdentifier } from '@oinone/kunlun-spi';
import type { TreeModelApi } from '../service';
import type { PamirsDepartment, PamirsOrganizationalStructure } from '../typing';
import type { DepartmentQueryFilter } from './PamirsDepartmentService';

export interface PamirsOrganizationalStructureService extends TreeModelApi<PamirsOrganizationalStructure> {
  queryListByFilter(query: DepartmentQueryFilter): Promise<PamirsDepartment[]>;
}

export const PamirsOrganizationalStructureServiceToken = ServiceIdentifier<PamirsOrganizationalStructureService>(
  'PamirsOrganizationalStructure'
);

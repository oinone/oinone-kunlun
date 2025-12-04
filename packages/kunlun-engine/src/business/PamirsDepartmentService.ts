import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { TreeModelApi } from '../service';
import { PamirsDepartment } from '../typing';

export interface DepartmentQueryFilter {
  rsql?: string;
  departmentCodes?: string[];
  userCompanyDept?: boolean;
  userDept?: boolean;
  userDeptAndChildren?: boolean;
}

export interface PamirsDepartmentService extends TreeModelApi<PamirsDepartment> {
  queryListByFilter(query: DepartmentQueryFilter): Promise<PamirsDepartment[]>;
}

export const PamirsDepartmentMetadata = {
  MODEL_MODEL: 'business.PamirsDepartment',
  MODEL_NAME: 'pamirsDepartment'
};

export const PamirsDepartmentServiceToken = ServiceIdentifier<PamirsDepartmentService>('PamirsDepartmentService');

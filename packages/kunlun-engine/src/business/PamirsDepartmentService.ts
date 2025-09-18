import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { QueryWrapper, TreeModelApi } from '../service';
import { PamirsDepartment } from '../typing';

export interface PamirsDepartmentService extends TreeModelApi<PamirsDepartment> {
  queryDepartmentRootList(queryWrapper: QueryWrapper): Promise<PamirsDepartment[]>;
}

export const PamirsDepartmentMetadata = {
  MODEL_MODEL: 'business.PamirsDepartment',
  MODEL_NAME: 'pamirsDepartment'
};

export const PamirsDepartmentServiceToken = ServiceIdentifier<PamirsDepartmentService>('PamirsDepartmentService');

import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { TreeModelApi } from '../service';
import { PamirsDepartment } from '../typing';

export type PamirsDepartmentService = TreeModelApi<PamirsDepartment>;

export const PamirsDepartmentMetadata = {
  MODEL_MODEL: 'business.PamirsDepartment',
  MODEL_NAME: 'pamirsDepartment'
};

export const PamirsDepartmentServiceToken = ServiceIdentifier<PamirsDepartmentService>('PamirsDepartmentService');

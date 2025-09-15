import { OioTreeNode } from '@oinone/kunlun-shared';
import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { ModelApi } from '../service';
import { PamirsDepartment } from '../typing';

export interface PamirsDepartmentService extends ModelApi<PamirsDepartment> {
  convertTreeData(
    list: PamirsDepartment[],
    options?: {
      computeTitle?: () => string;
    }
  ): OioTreeNode<PamirsDepartment>[];
}

export const PamirsDepartmentMetadata = {
  MODEL_MODEL: 'business.PamirsDepartment',
  MODEL_NAME: 'pamirsDepartment'
};

export const PamirsDepartmentToken = ServiceIdentifier<PamirsDepartmentService>('PamirsDepartmentService');

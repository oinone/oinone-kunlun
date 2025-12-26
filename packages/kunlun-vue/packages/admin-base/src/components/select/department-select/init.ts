import { PamirsDepartment, PamirsDepartmentServiceToken } from '@oinone/kunlun-engine';
import { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { ComputedRef, type Ref } from 'vue';
import { TreeInitOptions, TreeState, TreeStateLoadFunction, TreeStateProps, useTreeState } from '../../quick-utils';

export interface DepartmentTreeInstance {
  state: Ref<TreeState<PamirsDepartment>>;
  filterData: ComputedRef<OioTreeNode<PamirsDepartment>[]>;
  checkedAll: ComputedRef<boolean>;
  halfCheckedAll: ComputedRef<boolean>;

  init(options?: Partial<TreeInitOptions>): Promise<TreeState<PamirsDepartment>>;
}

export function useDepartmentTree(props?: TreeStateProps & { load?: TreeStateLoadFunction<PamirsDepartment> }) {
  return useTreeState({
    service: SPI.RawInstantiate(PamirsDepartmentServiceToken)!,
    props,
    load: props?.load
  });
}

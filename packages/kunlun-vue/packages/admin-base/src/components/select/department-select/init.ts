import { type PamirsDepartment, PamirsDepartmentServiceToken } from '@oinone/kunlun-engine';
import type { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import type { ComputedRef, Ref } from 'vue';
import { type TreeInitOptions, type TreeState, type TreeStateLoadFunction, type TreeStateProps, useTreeState } from '../../quick-utils';

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

import { PamirsDepartment, PamirsDepartmentServiceToken } from '@oinone/kunlun-engine';
import { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { ComputedRef, Ref } from 'vue';
import { TreeInitOptions, TreeState, useTreeState } from '../../quick-utils';

export interface DepartmentTreeInstance {
  state: Ref<TreeState<PamirsDepartment>>;
  filterData: ComputedRef<OioTreeNode<PamirsDepartment>[]>;
  checkedAll: ComputedRef<boolean>;
  halfCheckedAll: ComputedRef<boolean>;

  init(options?: Partial<TreeInitOptions>): Promise<TreeState<PamirsDepartment>>;
}

export function useDepartmentTree(options?: {
  mode?: SelectMode | keyof typeof SelectMode;
  getSearchValue?: () => string | null | undefined;
}) {
  return useTreeState({
    service: SPI.RawInstantiate(PamirsDepartmentServiceToken)!,
    props: options
  });
}

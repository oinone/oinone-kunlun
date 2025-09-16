import { PamirsEmployee, PamirsEmployeeServiceToken } from '@oinone/kunlun-engine';
import { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { ComputedRef, Ref } from 'vue';
import { ListInitOptions, ListState, TreeState, useListState } from '../../quick-utils';

export interface EmployeeListInstance {
  state: Ref<TreeState<PamirsEmployee>>;
  filterData: ComputedRef<OioTreeNode<PamirsEmployee>[]>;
  checkedAll: ComputedRef<boolean>;
  halfCheckedAll: ComputedRef<boolean>;

  init(options?: Partial<ListInitOptions>): Promise<ListState<PamirsEmployee>>;
}

export function useEmployeeList(options?: {
  mode?: SelectMode | keyof typeof SelectMode;
  getSearchValue?: () => string | null | undefined;
}) {
  return useListState({
    service: SPI.RawInstantiate(PamirsEmployeeServiceToken)!,
    props: options
  });
}

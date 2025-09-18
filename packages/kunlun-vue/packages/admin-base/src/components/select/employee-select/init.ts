import { PamirsEmployee, PamirsEmployeeServiceToken } from '@oinone/kunlun-engine';
import { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { ComputedRef, Ref } from 'vue';
import { ListInitOptions, ListState, ListStateProps, TreeState, useListState } from '../../quick-utils';

export interface EmployeeListInstance {
  state: Ref<TreeState<PamirsEmployee>>;
  filterData: ComputedRef<OioTreeNode<PamirsEmployee>[]>;
  checkedAll: ComputedRef<boolean>;
  halfCheckedAll: ComputedRef<boolean>;

  init(options?: Partial<ListInitOptions>): Promise<ListState<PamirsEmployee>>;

  search(options?: Partial<ListInitOptions>): Promise<ListState<PamirsEmployee>>;
}

export function useEmployeeList(props?: ListStateProps) {
  return useListState({
    service: SPI.RawInstantiate(PamirsEmployeeServiceToken)!,
    props
  });
}

import { type AuthRole, AuthRoleServiceToken } from '@oinone/kunlun-engine';
import type { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import type { ComputedRef, Ref } from 'vue';
import { type ListInitOptions, type ListState, type ListStateLoadFunction, type ListStateProps, type TreeState, useListState } from '../../quick-utils';

export interface RoleListInstance {
  state: Ref<TreeState<AuthRole>>;
  filterData: ComputedRef<OioTreeNode<AuthRole>[]>;
  checkedAll: ComputedRef<boolean>;
  halfCheckedAll: ComputedRef<boolean>;

  init(options?: Partial<ListInitOptions>): Promise<ListState<AuthRole>>;
}

export function useRoleList(props?: ListStateProps & { load?: ListStateLoadFunction<AuthRole> }) {
  return useListState({
    service: SPI.RawInstantiate(AuthRoleServiceToken)!,
    props,
    load: props?.load
  });
}

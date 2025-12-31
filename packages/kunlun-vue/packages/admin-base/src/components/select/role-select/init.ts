import { AuthRole, AuthRoleServiceToken } from '@oinone/kunlun-engine';
import { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { ComputedRef, Ref } from 'vue';
import {
  ListInitOptions,
  ListState,
  ListStateLoadFunction,
  ListStateProps,
  TreeState,
  useListState
} from '../../quick-utils';

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

import { AuthRole, AuthRoleToken, QueryWrapper } from '@oinone/kunlun-engine';
import { OioListItem } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { reactive } from 'vue';
import { useCheckedAll, useListChecked } from '../../quick-utils';

interface InitContext {
  storage: Record<string, OioListItem<AuthRole>>;
  count: number;
  checkedKeys: string[];
  expandedKeys: string[];
  expandedAll: boolean;
}

export interface RoleListInitOptions {
  rsql: string;
  checkedKeys: string[];
}

export interface RoleListState {
  mode: SelectMode;
  storage: Record<string, OioListItem<AuthRole>>;
  data: OioListItem<AuthRole>[];
  count: number;
  checkedAll: boolean;
  halfCheckedAll: boolean;
  checkedKeys: string[];
}

export interface RoleListInstance {
  init(options?: Partial<RoleListInitOptions>): Promise<RoleListState>;
}

export function useRoleList(options?: { mode?: SelectMode | keyof typeof SelectMode }) {
  const roleService = SPI.RawInstantiate(AuthRoleToken)!;

  const queryListByWrapper = async (rsql?: string): Promise<AuthRole[]> => {
    const queryWrapper: QueryWrapper = {};
    if (rsql) {
      queryWrapper.rsql = rsql;
    }
    return roleService.queryListByWrapper(queryWrapper);
  };

  const state: RoleListState = reactive({
    mode: (options?.mode as SelectMode) || SelectMode.multiple,
    storage: {},
    data: [],
    count: 0,
    checkedAll: false,
    halfCheckedAll: false,
    checkedKeys: []
  });

  const listCheckedMethods = useListChecked(state);
  const { onChecked } = listCheckedMethods;
  const { updateCheckedAllState } = useCheckedAll(state);

  const init = async (options?: Partial<RoleListInitOptions>): Promise<RoleListState> => {
    const roles = await queryListByWrapper(options?.rsql);
    state.data = roleService.convertListData(roles);
    initListState(initOptions(options));
    return state;
  };

  const initOptions = (options?: Partial<RoleListInitOptions>): RoleListInitOptions => {
    return {
      rsql: options?.rsql || '',
      checkedKeys: options?.checkedKeys || []
    };
  };

  const initListState = (options: RoleListInitOptions) => {
    const context: InitContext = {
      storage: {},
      count: 0,
      checkedKeys: options.checkedKeys,
      expandedKeys: [],
      expandedAll: state.data.length <= 100
    };
    state.checkedKeys = [];
    $$initListState(context, state.data);
    state.count = context.count;
    state.storage = context.storage;
    updateCheckedAllState();
  };

  const $$initListState = (context: InitContext, items: OioListItem<AuthRole>[]) => {
    for (const item of items) {
      const { key } = item;
      if (context.checkedKeys.indexOf(key) > -1) {
        onChecked(item, true);
      }
      context.count++;
      context.storage[key] = item;
    }
  };

  return {
    state,
    init,
    updateCheckedAllState,
    ...listCheckedMethods
  };
}

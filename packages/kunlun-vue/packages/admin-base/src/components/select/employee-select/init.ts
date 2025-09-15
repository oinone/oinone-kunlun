import { PamirsDepartment, PamirsEmployee, PamirsEmployeeToken, QueryWrapper } from '@oinone/kunlun-engine';
import { OioListItem } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { reactive } from 'vue';
import { useListChecked } from '../../quick-utils';
import { useCheckedAll } from '../../quick-utils/checked-all';

interface InitContext {
  storage: Record<string, OioListItem<PamirsDepartment>>;
  count: number;
  checkedKeys: string[];
  expandedKeys: string[];
  expandedAll: boolean;
}

export interface EmployeeListInitOptions {
  rsql: string;
  checkedKeys: string[];
}

export interface EmployeeListState {
  mode: SelectMode;
  storage: Record<string, OioListItem<PamirsEmployee>>;
  data: OioListItem<PamirsEmployee>[];
  count: number;
  checkedAll: boolean;
  halfCheckedAll: boolean;
  checkedKeys: string[];
}

export interface EmployeeListInstance {
  init(options?: Partial<EmployeeListInitOptions>): Promise<EmployeeListState>;
}

export function useEmployeeList(options?: { mode?: SelectMode | keyof typeof SelectMode }) {
  const employeeService = SPI.RawInstantiate(PamirsEmployeeToken)!;

  const queryListByWrapper = async (rsql?: string): Promise<PamirsEmployee[]> => {
    const queryWrapper: QueryWrapper = {};
    if (rsql) {
      queryWrapper.rsql = rsql;
    }
    return employeeService.queryListByWrapper(queryWrapper);
  };

  const state: EmployeeListState = reactive({
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

  const init = async (options?: Partial<EmployeeListInitOptions>): Promise<EmployeeListState> => {
    const employees = await queryListByWrapper(options?.rsql);
    state.data = employeeService.convertListData(employees);
    initListState(initOptions(options));
    return state;
  };

  const initOptions = (options?: Partial<EmployeeListInitOptions>): EmployeeListInitOptions => {
    return {
      rsql: options?.rsql || '',
      checkedKeys: options?.checkedKeys || []
    };
  };

  const initListState = (options: EmployeeListInitOptions) => {
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

  const $$initListState = (context: InitContext, items: OioListItem<PamirsDepartment>[]) => {
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

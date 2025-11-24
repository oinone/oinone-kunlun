<script lang="ts">
import {
  AuthRole,
  PamirsDepartment,
  PamirsDepartmentService,
  PamirsEmployee,
  PamirsEmployeeService,
  QueryWrapper
} from '@oinone/kunlun-engine';
import { OioSelectItem } from '@oinone/kunlun-shared';
import {
  CastHelper,
  OioDivider,
  OioInput,
  OioInputSearch,
  OioListItem,
  OioModal,
  OioModalProps,
  OioTab,
  OioTabs,
  PropRecordHelper,
  RSQLCondition,
  RSQLHelper,
  SelectMode,
  StringHelper
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType, reactive, ref, Ref, VNode } from 'vue';
import { ListState, TreeState } from '../../quick-utils';
import { BaseSelect } from '../base';
import { DepartmentTree } from '../department-select';
import { RoleList } from '../role-select';
import EmployeeList from './EmployeeList.vue';
import { EmployeeListInstance } from './init';

interface State {
  storage: Record<string, OioListItem<PamirsEmployee>>;
  loading: boolean;
  searchValue: string;
  activeKey?: string;
  checkedKeys: string[];
  selectedRoleCode?: string;
}

export default defineComponent({
  name: 'EmployeeModal',
  components: {
    OioInput,
    OioModal,
    OioTab,
    OioTabs,
    DepartmentTree
  },
  props: {
    ...OioModalProps,
    mode: {
      type: String as PropType<SelectMode | keyof typeof SelectMode>
    },
    selected: {
      type: [Object, Array] as PropType<OioSelectItem<PamirsEmployee> | OioSelectItem<PamirsEmployee>[]>
    },
    allowClear: {
      type: Boolean
    },
    domain: {
      type: String
    },
    employeeCodes: {
      type: Array as PropType<string[]>
    },
    departmentCodes: {
      type: Array as PropType<string[]>
    },
    roleCodes: {
      type: Array as PropType<string[]>
    },
    userEmployee: {
      type: Boolean
    },
    userDept: {
      type: Boolean
    },
    userDeptAndChildren: {
      type: Boolean
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const employeeListRef1: Ref<EmployeeListInstance | undefined> = ref();
    const employeeListRef2: Ref<EmployeeListInstance | undefined> = ref();

    const state: State = reactive({
      storage: {},
      loading: false,
      searchValue: '',
      activeKey: 'department',
      checkedKeys: []
    });

    const initCheckedKeys = computed(() => {
      let checkedKeys: string[] = [];
      if (props.selected != null) {
        if (Array.isArray(props.selected)) {
          checkedKeys = props.selected.map((v) => v.key);
        } else {
          checkedKeys = [props.selected.key];
        }
      }
      return checkedKeys;
    });

    const selectedValues = computed(() => {
      const selectedItems: OioSelectItem<PamirsEmployee>[] = [];
      let checkedKeys: string[];
      if (props.mode === SelectMode.single) {
        const firstKey = state.checkedKeys[0];
        if (firstKey) {
          checkedKeys = [firstKey];
        } else {
          checkedKeys = [];
        }
      } else {
        checkedKeys = state.checkedKeys;
      }
      for (const checkedKey of checkedKeys) {
        const item = state.storage[checkedKey];
        if (!item) {
          continue;
        }
        const { key, value, label, data } = item;
        selectedItems.push({
          key,
          value,
          label,
          data
        });
      }
      return selectedItems;
    });

    const deptDomain = computed(() => {
      const departmentCodes = props.departmentCodes || [];
      if (departmentCodes.length) {
        return RSQLCondition.wrapper().in('code', departmentCodes).toString();
      }
      return undefined;
    });

    const roleDomain = computed(() => {
      const roleCodes = props.roleCodes || [];
      if (roleCodes.length) {
        return RSQLCondition.wrapper().in('code', roleCodes).toString();
      }
      return undefined;
    });

    const enterCallback = () => {
      if (props.mode === SelectMode.single) {
        emit('change', selectedValues.value[0]?.data);
      } else {
        emit(
          'change',
          selectedValues.value.map((v) => v.data)
        );
      }
      return true;
    };

    const deptEmployeeLoad = (
      res: ListState<PamirsEmployee>,
      service: PamirsEmployeeService,
      queryWrapper: QueryWrapper
    ) => {
      return service.queryListByDslFilter({
        domain: queryWrapper.rsql,
        employeeCodes: props.employeeCodes,
        departmentCodes: props.departmentCodes,
        roleCodes: props.roleCodes,
        userEmployee: props.userEmployee,
        userDept: props.userDept,
        userDeptAndChildren: props.userDeptAndChildren
      });
    };

    const roleEmployeeLoad = (
      res: ListState<PamirsEmployee>,
      service: PamirsEmployeeService,
      queryWrapper: QueryWrapper
    ) => {
      if (state.selectedRoleCode != null) {
        return service.queryListByDslFilter({
          domain: queryWrapper.rsql,
          employeeCodes: props.employeeCodes,
          departmentCodes: props.departmentCodes,
          roleCodes: [state.selectedRoleCode],
          userEmployee: props.userEmployee,
          userDept: props.userDept,
          userDeptAndChildren: props.userDeptAndChildren
        });
      }
      return service.queryListByDslFilter({
        domain: queryWrapper.rsql,
        employeeCodes: props.employeeCodes,
        departmentCodes: props.departmentCodes,
        roleCodes: props.roleCodes,
        userEmployee: props.userEmployee,
        userDept: props.userDept,
        userDeptAndChildren: props.userDeptAndChildren
      });
    };

    const departmentLoad = async (
      res: TreeState<PamirsDepartment>,
      service: PamirsDepartmentService,
      queryWrapper: QueryWrapper
    ) => {
      return service.queryDepartmentRootList(queryWrapper);
    };

    const onUpdateState = (key: string, value: unknown) => {
      state[key] = value;
    };

    const onInit = (res: ListState<PamirsEmployee>) => {
      state.storage = res.storage;
      state.checkedKeys = res.checkedKeys;
    };

    const onDepartmentSelected = async ({ selectedKeys }: { selectedKeys: string[] }) => {
      if (selectedKeys.length) {
        const rsql = RSQLCondition.wrapper().eq('departmentList.code', selectedKeys[0]).toString();
        await $$searchEmployeeList(employeeListRef1.value!, rsql);
      } else {
        await $$initEmployeeList(employeeListRef1.value!);
      }
    };

    const onRoleSelected = async (item: OioListItem<AuthRole>, selected: boolean) => {
      if (selected) {
        state.selectedRoleCode = item.key;
        await $$searchEmployeeList(employeeListRef2.value!);
      } else {
        state.selectedRoleCode = undefined;
        await $$initEmployeeList(employeeListRef2.value!);
      }
    };

    const $$initEmployeeList = async (instance: EmployeeListInstance, rsql?: string) => {
      state.loading = true;
      try {
        return await instance.init({
          rsql: RSQLHelper.concatByAnd(props.domain, rsql),
          checkedKeys: state.checkedKeys
        });
      } finally {
        state.loading = false;
      }
    };

    const $$searchEmployeeList = async (instance: EmployeeListInstance, rsql?: string) => {
      state.loading = true;
      try {
        return await instance.search({
          rsql: RSQLHelper.concatByAnd(props.domain, rsql),
          checkedKeys: state.checkedKeys
        });
      } finally {
        state.loading = false;
      }
    };

    return {
      employeeListRef1,
      employeeListRef2,

      state,
      initCheckedKeys,
      selectedValues,
      deptDomain,
      roleDomain,
      enterCallback,
      deptEmployeeLoad,
      roleEmployeeLoad,
      departmentLoad,
      onUpdateState,
      onInit,
      onDepartmentSelected,
      onRoleSelected
    };
  },
  render() {
    const {
      $translate,
      mode,
      allowClear,
      domain,

      state,
      initCheckedKeys,
      selectedValues,
      deptDomain,
      roleDomain,
      enterCallback,
      deptEmployeeLoad,
      roleEmployeeLoad,
      departmentLoad,
      onUpdateState,
      onInit,
      onDepartmentSelected,
      onRoleSelected
    } = this;
    const tabTitleList = [
      {
        key: 'department',
        label: '通过部门选择员工'
      },
      {
        key: 'role',
        label: '通过角色选择员工'
      }
    ];
    const tabList: VNode[] = [];
    tabList.push(
      createVNode('div', { class: 'oio-department-employee-selected-panel' }, [
        createVNode(DepartmentTree, {
          autoInit: true,
          domain: deptDomain,
          load: departmentLoad,
          selectable: true,
          onSelected: onDepartmentSelected
        }),
        createVNode(OioDivider, { type: 'vertical' }),
        createVNode(EmployeeList, {
          ref: 'employeeListRef1',
          searchValue: state.searchValue,
          selectMode: mode,
          showCheckedAll: true,
          loading: state.loading,
          usingLoading: false,
          autoInit: true,
          load: deptEmployeeLoad,
          domain,
          initCheckedKeys,
          checkedKeys: state.checkedKeys,
          onInit,
          'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
          'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
        })
      ])
    );
    tabList.push(
      createVNode('div', { class: 'oio-role-employee-selected-panel' }, [
        createVNode(RoleList, {
          autoInit: true,
          domain: roleDomain,
          selectable: true,
          onSelected: onRoleSelected
        }),
        createVNode(OioDivider, { type: 'vertical' }),
        createVNode(EmployeeList, {
          ref: 'employeeListRef2',
          searchValue: state.searchValue,
          selectMode: mode,
          showCheckedAll: true,
          loading: state.loading,
          usingLoading: false,
          autoInit: true,
          load: roleEmployeeLoad,
          domain,
          initCheckedKeys,
          checkedKeys: state.checkedKeys,
          onInit,
          'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
          'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
        })
      ])
    );
    return createVNode(
      OioModal,
      {
        title: $translate('选择员工'),
        width: '720px',
        height: '664px',
        maskClosable: false,
        ...PropRecordHelper.convert(OioModalProps, CastHelper.cast(this)),
        wrapperClassName: StringHelper.append(['oio-employee-modal'], this.wrapperClassName),
        destroyOnClose: true,
        loading: state.loading,
        enterCallback
      },
      {
        default: () => {
          return [
            createVNode('div', { class: 'oio-employee-modal-content' }, [
              createVNode(BaseSelect, {
                mode: SelectMode.multiple,
                value: selectedValues,
                allowClear,
                placeholder: $translate('选择员工'),
                allowArrow: false,
                allowSearch: false,
                notFoundContent: null,
                change: (items: OioSelectItem[]) =>
                  onUpdateState(
                    'checkedKeys',
                    items.map((v) => v.key)
                  )
              }),
              createVNode(OioInputSearch, {
                value: state.searchValue,
                placeholder: $translate('搜索'),
                allowClear: true,
                'onUpdate:value': (val: string) => onUpdateState('searchValue', val)
              }),
              createVNode(
                OioTabs,
                {
                  activeKey: state.activeKey,
                  'onUpdate:activeKey': (val: string) => onUpdateState('activeKey', val)
                },
                {
                  default: () => {
                    const tabs: VNode[] = [];
                    for (let i = 0; i < tabTitleList.length; i++) {
                      const { key, label } = tabTitleList[i];
                      const tab = tabList[i];
                      tabs.push(
                        createVNode(
                          OioTab,
                          { key, tab: $translate(label) },
                          {
                            default: () => tab
                          }
                        )
                      );
                    }
                    return tabs;
                  }
                }
              )
            ])
          ];
        }
      }
    );
  }
});
</script>
<style lang="scss">
.oio-employee-modal {
  .ant-modal-body {
    overflow-x: hidden;

    & > .oio-spin-wrapper {
      height: 100%;

      & > .ant-spin-container {
        height: 100%;
      }
    }
  }

  .oio-employee-modal-content {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    height: 100%;

    & > .oio-tabs {
      position: relative;
      flex: 1;

      & > .ant-tabs-content-holder {
        position: absolute;
        width: 100%;
        height: calc(100% - 54px);
        top: 54px;

        .ant-tabs-content,
        .oio-tab,
        .oio-tab-content {
          height: 100%;
        }
      }
    }

    .oio-department-tree,
    .oio-employee-list,
    .oio-role-list {
      height: 100%;
      overflow: auto;
    }

    .oio-department-employee-selected-panel {
      height: 100%;
      position: relative;
      display: flex;

      .oio-department-tree {
        width: 50%;
        flex-basis: 50%;
        padding-right: 8px;
      }

      .oio-divider {
        position: absolute;
        height: 100%;
        left: 50%;
      }

      .oio-employee-list {
        width: 50%;
        flex-basis: 50%;
        padding-left: 8px;
      }
    }

    .oio-role-employee-selected-panel {
      height: 100%;
      position: relative;
      display: flex;

      .oio-role-list {
        width: 50%;
        flex-basis: 50%;
        padding-right: 8px;
      }

      .oio-divider {
        position: absolute;
        height: 100%;
        left: 50%;
      }

      .oio-employee-list {
        width: 50%;
        flex-basis: 50%;
        padding-left: 8px;
      }
    }
  }
}
</style>

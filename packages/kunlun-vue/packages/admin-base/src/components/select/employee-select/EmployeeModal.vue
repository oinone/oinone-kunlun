<script lang="ts">
import { AuthRole, PamirsEmployee } from '@oinone/kunlun-engine';
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
import { ListState } from '../../quick-utils';
import { BaseSelect } from '../base';
import { DepartmentTree } from '../department-select';
import { RoleList } from '../role-select';
import EmployeeList from './EmployeeList.vue';
import { EmployeeListInstance } from './init';

interface State {
  storage: Record<string, OioListItem<PamirsEmployee>>;
  loading: boolean;
  searchValue: string;
  checkedKeys: string[];
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
    domain: {
      type: String
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

    const showRolePanel = computed(() => {
      if (!props.roleCodes) {
        return true;
      }
      return !!props.roleCodes.length;
    });

    const employeeDomain = computed(() => {
      const departmentCodes = props.departmentCodes || [];
      if (departmentCodes.length) {
        return RSQLHelper.concatByOr(
          props.domain,
          RSQLCondition.wrapper().in('departmentCode', departmentCodes).toString()
        );
      }
      return undefined;
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

    const onUpdateState = (key: string, value: unknown) => {
      state[key] = value;
    };

    const onInit = (res: ListState<PamirsEmployee>) => {
      state.storage = res.storage;
      state.checkedKeys = res.checkedKeys;
    };

    const onDepartmentSelected = async ({ selectedKeys }: { selectedKeys: string[] }) => {
      if (selectedKeys.length) {
        const rsql = RSQLCondition.wrapper().in('departmentCode', selectedKeys).toString();
        await $$searchEmployeeList(employeeListRef1.value!, rsql);
      } else {
        await $$initEmployeeList(employeeListRef1.value!);
      }
    };

    const onRoleSelected = async (item: OioListItem<AuthRole>, selected: boolean) => {
      if (selected) {
        const rsql = RSQLCondition.wrapper().eq('departmentCode', item.key).toString();
        await $$searchEmployeeList(employeeListRef2.value!, rsql);
      } else {
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
      showRolePanel,
      employeeDomain,
      deptDomain,
      roleDomain,
      enterCallback,
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
      userEmployee,
      userDept,
      userDeptAndChildren,

      state,
      initCheckedKeys,
      selectedValues,
      showRolePanel,
      employeeDomain,
      deptDomain,
      roleDomain,
      enterCallback,
      onUpdateState,
      onInit,
      onDepartmentSelected,
      onRoleSelected
    } = this;
    const tabTitleList = [
      {
        key: 'department',
        label: '通过部门选择'
      }
    ];
    const tabList: VNode[] = [];
    tabList.push(
      createVNode('div', { class: 'oio-department-employee-selected-panel' }, [
        createVNode(DepartmentTree, {
          autoInit: true,
          domain: deptDomain,
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
          domain: employeeDomain,
          initCheckedKeys,
          checkedKeys: state.checkedKeys,
          onInit,
          'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
          'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
        })
      ])
    );
    if (showRolePanel) {
      tabTitleList.push({
        key: 'role',
        label: '通过角色选择'
      });
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
            domain: employeeDomain,
            initCheckedKeys,
            checkedKeys: state.checkedKeys,
            onInit,
            'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
            'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
          })
        ])
      );
    }
    if (userEmployee) {
      tabTitleList.push({
        key: 'userEmployee',
        label: '当前用户所绑定员工'
      });
      tabList.push(
        createVNode(EmployeeList, {
          searchValue: state.searchValue,
          selectMode: mode,
          showCheckedAll: true,
          autoInit: true,
          checkedKeys: state.checkedKeys,
          'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
        })
      );
    }
    if (userDept) {
      tabTitleList.push({
        key: 'userDept',
        label: '当前用户所属部门中的员工'
      });
      tabList.push(
        createVNode(EmployeeList, {
          searchValue: state.searchValue,
          selectMode: mode,
          showCheckedAll: true,
          autoInit: true,
          checkedKeys: state.checkedKeys,
          'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
        })
      );
    }
    if (userDeptAndChildren) {
      tabTitleList.push({
        key: 'userDeptAndChildren',
        label: '当前用户所属部门及下属部门中的员工'
      });
      tabList.push(
        createVNode(EmployeeList, {
          searchValue: state.searchValue,
          selectMode: mode,
          showCheckedAll: true,
          autoInit: true,
          checkedKeys: state.checkedKeys,
          'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
        })
      );
    }
    let content: VNode;
    if (tabTitleList.length === 1) {
      [content] = tabList;
    } else {
      content = createVNode(
        OioTabs,
        {},
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
      );
    }
    return createVNode(
      OioModal,
      {
        title: $translate('选择员工'),
        width: '720px',
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
                options: selectedValues,
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
              content
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
  .oio-employee-modal-content {
    display: flex;
    flex-direction: column;
    row-gap: 16px;

    & > .oio-tabs,
    & > .oio-employee-list {
      flex: 1;
    }

    .oio-tab-content {
      height: 400px;
      overflow: auto;
    }

    .oio-department-employee-selected-panel {
      position: relative;
      display: flex;

      .oio-department-tree {
        width: 50%;
        flex-basis: 50%;
        padding-right: 8px;
        overflow: auto;
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
        overflow: auto;
      }
    }

    .oio-role-employee-selected-panel {
      position: relative;
      display: flex;

      .oio-role-list {
        width: 50%;
        flex-basis: 50%;
        padding-right: 8px;
        overflow: auto;
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
        overflow: auto;
      }
    }
  }
}
</style>

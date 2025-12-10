<script lang="ts">
import { PamirsEmployee, PamirsEmployeeService, QueryWrapper } from '@oinone/kunlun-engine';
import { OioSelectItem } from '@oinone/kunlun-shared';
import {
  CastHelper,
  OioEmptyData,
  OioInput,
  OioInputSearch,
  OioListItem,
  OioModal,
  OioModalProps,
  OioTab,
  OioTabs,
  PropRecordHelper,
  SelectMode,
  StringHelper
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType, reactive, VNode, watch } from 'vue';
import { CheckedHelper, ListState } from '../../quick-utils';
import { BaseSelect } from '../base';
import { OrganizationalStructureTree } from '../organizational-structure-tree';
import DepartmentEmployeeSelectPanel from './DepartmentEmployeeSelectPanel.vue';
import EmployeeList from './EmployeeList.vue';
import RoleEmployeeSelectPanel from './RoleEmployeeSelectPanel.vue';

interface BaseState {
  init: boolean;
  storage: Record<string, OioListItem<PamirsEmployee>>;
}

interface State extends BaseState {
  loading: boolean;
  searchValue: string;
  checkedKeys: string[];
  departmentSelectedKeys: string[];
  roleSelectedKeys: string[];
}

export default defineComponent({
  name: 'EmployeeModal',
  components: {
    OioInput,
    OioModal,
    OioTab,
    OioTabs,
    OrganizationalStructureTree,
    DepartmentEmployeeSelectPanel,
    RoleEmployeeSelectPanel
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
    const state: State = reactive({
      init: false,
      storage: {},
      loading: false,
      searchValue: '',
      checkedKeys: [],
      departmentSelectedKeys: [],
      roleSelectedKeys: []
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

    const deptEmployeeLoad = (
      res: ListState<PamirsEmployee>,
      service: PamirsEmployeeService,
      queryWrapper: QueryWrapper
    ) => {
      return service.queryListByFilter({
        rsql: queryWrapper.rsql,
        employeeCodes: props.employeeCodes,
        departmentCodes: props.departmentCodes,
        roleCodes: props.roleCodes,
        userEmployee: props.userEmployee,
        userDept: props.userDept,
        userDeptAndChildren: props.userDeptAndChildren
      });
    };

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

    const currentEmployeeLoad = (
      res: ListState<PamirsEmployee>,
      service: PamirsEmployeeService,
      queryWrapper: QueryWrapper
    ) => {
      return service.queryListByFilter({
        rsql: queryWrapper.rsql,
        userEmployee: props.userEmployee,
        userDept: props.userDept,
        userDeptAndChildren: props.userDeptAndChildren
      });
    };

    const onUpdateState = (key: string, value: unknown) => {
      state[key] = value;
    };

    const onInit = (res: ListState<PamirsEmployee>) => {
      state.init = true;
      state.storage = res.storage;
      state.checkedKeys = res.checkedKeys;
    };

    const roleEmployeeListState: BaseState = reactive({
      init: false,
      storage: {}
    });

    const onInitRoleEmployeeList = (res: ListState<PamirsEmployee>) => {
      roleEmployeeListState.init = true;
      roleEmployeeListState.storage = res.storage;
    };

    const onUpdateCheckedKeysByRoleEmployeeList = (checkedKeys: string[]) => {
      state.checkedKeys = CheckedHelper.diffListCheckedKeys(
        state.storage,
        roleEmployeeListState.storage,
        state.checkedKeys,
        checkedKeys
      );
    };

    const userEmployeeListState: BaseState = reactive({
      init: false,
      storage: {}
    });

    const onInitUserEmployeeList = (res: ListState<PamirsEmployee>) => {
      userEmployeeListState.init = true;
      userEmployeeListState.storage = res.storage;
    };

    const onUpdateCheckedKeysByUserEmployeeList = (checkedKeys: string[]) => {
      state.checkedKeys = CheckedHelper.diffListCheckedKeys(
        state.storage,
        userEmployeeListState.storage,
        state.checkedKeys,
        checkedKeys
      );
    };

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          state.init = false;
          roleEmployeeListState.init = false;
          userEmployeeListState.init = false;
        }
      }
    );

    return {
      state,
      initCheckedKeys,
      selectedValues,
      deptEmployeeLoad,
      enterCallback,
      currentEmployeeLoad,
      onUpdateState,
      onInit,

      roleEmployeeListState,
      onInitRoleEmployeeList,
      onUpdateCheckedKeysByRoleEmployeeList,
      userEmployeeListState,
      onInitUserEmployeeList,
      onUpdateCheckedKeysByUserEmployeeList
    };
  },
  render() {
    const {
      $translate,
      mode,
      allowClear,
      domain,
      employeeCodes,
      departmentCodes,
      roleCodes,
      userEmployee,
      userDept,
      userDeptAndChildren,

      state,
      initCheckedKeys,
      selectedValues,
      deptEmployeeLoad,
      enterCallback,
      currentEmployeeLoad,
      onUpdateState,
      onInit,
      onInitRoleEmployeeList,
      onUpdateCheckedKeysByRoleEmployeeList,
      onInitUserEmployeeList,
      onUpdateCheckedKeysByUserEmployeeList
    } = this;
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
          if (state.init && !Object.keys(state.storage).length) {
            return createVNode(OioEmptyData);
          }
          const tabs: { key: string; label: string }[] = [];
          const vNodes: VNode[] = [];
          tabs.push({
            key: 'employee',
            label: '员工'
          });
          let showFullPanel = false;
          let usingDepartmentSelect = userDept || userDeptAndChildren || departmentCodes?.length;
          if (!usingDepartmentSelect && !employeeCodes?.length && !roleCodes?.length && !userEmployee) {
            usingDepartmentSelect = true;
            showFullPanel = true;
          }
          if (usingDepartmentSelect) {
            vNodes.push(
              createVNode(DepartmentEmployeeSelectPanel, {
                state,
                onUpdateState,
                mode,
                initCheckedKeys,
                onInit,
                domain,
                employeeCodes,
                departmentCodes,
                roleCodes,
                userEmployee,
                userDept,
                userDeptAndChildren
              })
            );
          } else {
            vNodes.push(
              createVNode('div', { class: 'oio-employee-selected-panel' }, [
                createVNode(EmployeeList, {
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
          }
          if (showFullPanel || roleCodes?.length) {
            tabs.push({
              key: 'role',
              label: '角色'
            });
            vNodes.push(
              createVNode(RoleEmployeeSelectPanel, {
                state,
                mode,
                onUpdateState,
                initCheckedKeys,
                domain,
                roleCodes,
                onInit: onInitRoleEmployeeList,
                onUpdateCheckedKeys: onUpdateCheckedKeysByRoleEmployeeList
              })
            );
          }
          if (showFullPanel || userEmployee || userDept || userDeptAndChildren) {
            tabs.push({
              key: 'user-employee',
              label: '当前用户'
            });
            vNodes.push(
              createVNode('div', { class: 'oio-employee-selected-panel' }, [
                createVNode(EmployeeList, {
                  searchValue: state.searchValue,
                  selectMode: mode,
                  showCheckedAll: true,
                  loading: state.loading,
                  usingLoading: false,
                  autoInit: true,
                  load: currentEmployeeLoad,
                  domain,
                  initCheckedKeys: state.checkedKeys,
                  checkedKeys: state.checkedKeys,
                  onInit: onInitUserEmployeeList,
                  'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
                  'onUpdate:checkedKeys': onUpdateCheckedKeysByUserEmployeeList
                })
              ])
            );
          }
          const children: VNode[] = [];
          if (vNodes.length === 1) {
            children.push(vNodes[0]);
          } else {
            children.push(
              createVNode(
                OioTabs,
                {},
                {
                  default: () =>
                    tabs.map((v, i) => {
                      return createVNode(
                        OioTab,
                        {
                          key: v.key,
                          tab: $translate(v.label)
                        },
                        {
                          default: () => [vNodes[i]]
                        }
                      );
                    })
                }
              )
            );
          }
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
              ...children
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

    .oio-organizational-structure-tree,
    .oio-employee-list,
    .oio-role-list {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>

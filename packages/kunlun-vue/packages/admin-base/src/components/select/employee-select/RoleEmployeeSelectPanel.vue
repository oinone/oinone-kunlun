<script lang="ts">
import { type AuthRole, type PamirsEmployee, type PamirsEmployeeService, QueryWrapper } from '@oinone/kunlun-engine';
import { OioDivider, OioListItem, RSQLCondition, RSQLHelper, SelectMode } from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, type PropType, type Ref, ref } from 'vue';
import type { ListState } from '../../quick-utils';
import { RoleList } from '../role-select';
import EmployeeList from './EmployeeList.vue';
import type { EmployeeListInstance } from './init';

export default defineComponent({
  name: 'RoleEmployeeSelectPanel',
  components: {},
  props: {
    state: {
      type: Object as PropType<{
        loading: boolean;
        searchValue: string;
        checkedKeys: string[];
      }>,
      required: true
    },
    onUpdateState: {
      type: Function as PropType<(key: string, value: unknown) => void>,
      required: true
    },
    mode: {
      type: String as PropType<SelectMode | keyof typeof SelectMode>
    },
    model: {
      type: String
    },
    employeeModel: {
      type: String
    },
    domain: {
      type: String
    },
    roleCodes: {
      type: Array as PropType<string[]>
    },
    onInit: {
      type: Function
    },
    onUpdateCheckedKeys: {
      type: Function
    }
  },
  setup(props) {
    const employeeListRef: Ref<EmployeeListInstance | undefined> = ref();

    const state = new Proxy(props.state, {
      get(target, p, receiver) {
        return Reflect.get(target, p, receiver);
      },
      set(target, p, value, receiver) {
        props.onUpdateState(p as string, value);
        return true;
      }
    });

    const currentState = ref<{
      roleSelectedKeys: string[];
    }>({
      roleSelectedKeys: []
    });

    const roleDomain = computed(() => {
      const roleCodes = props.roleCodes || [];
      if (roleCodes.length) {
        return RSQLCondition.wrapper().in('code', roleCodes).toString();
      }
      return undefined;
    });

    const roleEmployeeLoad = (
      res: ListState<PamirsEmployee>,
      service: PamirsEmployeeService,
      queryWrapper: QueryWrapper
    ) => {
      if (currentState.value.roleSelectedKeys.length) {
        return service.queryListByFilter({
          model: props.employeeModel,
          rsql: queryWrapper.rsql,
          roleCodes: currentState.value.roleSelectedKeys
        });
      }
      return service.queryListByFilter({
        model: props.employeeModel,
        rsql: queryWrapper.rsql,
        roleCodes: props.roleCodes
      });
    };

    const onUpdateCheckedKeys = (checkedKeys: string[]) => {
      if (props.onUpdateCheckedKeys) {
        props.onUpdateCheckedKeys(checkedKeys);
      } else {
        state.checkedKeys = checkedKeys;
      }
    };

    const onRoleSelected = async (item: OioListItem<AuthRole> | undefined, selected: boolean) => {
      if (selected) {
        await $$searchEmployeeList(employeeListRef.value!);
      } else {
        await $$initEmployeeList(employeeListRef.value!);
      }
    };

    const onRoleSelectedAllEmployee = () => {
      currentState.value.roleSelectedKeys = [];
      onRoleSelected(undefined, false);
    };

    const $$initEmployeeList = async (instance: EmployeeListInstance, rsql?: string) => {
      state.loading = true;
      try {
        return await instance.init({
          model: props.employeeModel,
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
          model: props.employeeModel,
          rsql: RSQLHelper.concatByAnd(props.domain, rsql),
          checkedKeys: state.checkedKeys
        });
      } finally {
        state.loading = false;
      }
    };

    return {
      employeeListRef,
      state,
      currentState,
      roleDomain,
      roleEmployeeLoad,
      onUpdateCheckedKeys,
      onRoleSelected,
      onRoleSelectedAllEmployee
    };
  },
  render() {
    const {
      $translate,
      mode,
      model,
      employeeModel,
      domain,
      state,
      currentState,
      roleDomain,
      onInit,
      onUpdateCheckedKeys,

      roleEmployeeLoad,
      onRoleSelected,
      onRoleSelectedAllEmployee
    } = this;
    return createVNode('div', { class: 'oio-role-employee-selected-panel' }, [
      createVNode('div', { class: 'oio-role-selected-wrapper oio-scrollbar' }, [
        createVNode('div', { class: 'oio-role-selected-all-employee-node' }, [
          createVNode(
            'div',
            {
              class: [
                'oio-role-selected-all-employee-node-content-wrapper',
                !currentState.roleSelectedKeys.length && 'oio-role-selected-all-employee-node-selected'
              ],
              onClick: onRoleSelectedAllEmployee
            },
            $translate('全部员工')
          )
        ]),
        createVNode(RoleList, {
          autoInit: true,
          model,
          domain: roleDomain,
          selectable: true,
          selectedKeys: currentState.roleSelectedKeys,
          onSelected: onRoleSelected,
          'onUpdate:selectedKeys': (val: string[]) => (currentState.roleSelectedKeys = val)
        })
      ]),
      createVNode(OioDivider, { type: 'vertical' }),
      createVNode(EmployeeList, {
        ref: 'employeeListRef',
        searchValue: state.searchValue,
        selectMode: mode,
        showCheckedAll: true,
        loading: state.loading,
        usingLoading: false,
        autoInit: true,
        load: roleEmployeeLoad,
        model: employeeModel,
        domain,
        initCheckedKeys: state.checkedKeys,
        checkedKeys: state.checkedKeys,
        onInit,
        'onUpdate:loading': (val: boolean) => (state.loading = val),
        'onUpdate:checkedKeys': onUpdateCheckedKeys
      })
    ]);
  }
});
</script>
<style lang="scss">
.oio-role-employee-selected-panel {
  height: 400px;
  position: relative;
  display: flex;

  .oio-role-selected-wrapper {
    width: 50%;
    flex-basis: 50%;
    padding-right: 8px;
    overflow: auto;
    display: flex;
    flex-direction: column;

    .oio-role-selected-all-employee-node {
      line-height: 24px;
      font-size: 14px;
      color: var(--oio-text-color);
      padding-bottom: 4px;

      &-content-wrapper {
        padding: 0 4px;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background-color: var(--oio-menu-hover-background-color);
        }
      }

      &-selected {
        background-color: rgba(var(--oio-primary-color-rgb), 0.1);
      }
    }

    .oio-organizational-structure-tree {
      flex: 1;
    }
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
</style>

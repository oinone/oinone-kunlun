<script lang="ts">
import {
  OrganizationalStructureType,
  PamirsDepartment,
  PamirsDepartmentService,
  PamirsEmployee,
  PamirsEmployeeService,
  QueryWrapper
} from '@oinone/kunlun-engine';
import { OioDivider, RSQLCondition, RSQLHelper, SelectMode } from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType, Ref, ref } from 'vue';
import { ListState, TreeState } from '../../quick-utils';
import { OrganizationalStructureTree } from '../organizational-structure-tree';
import EmployeeList from './EmployeeList.vue';
import { EmployeeListInstance } from './init';

export default defineComponent({
  name: 'DepartmentEmployeeSelectPanel',
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
    initCheckedKeys: {
      type: Array as PropType<string[]>
    },
    onInit: {
      type: Function
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
      departmentSelectedKeys: string[];
    }>({
      departmentSelectedKeys: []
    });

    const deptDomain = computed(() => {
      const departmentCodes = props.departmentCodes || [];
      if (departmentCodes.length) {
        return RSQLCondition.wrapper().in('code', departmentCodes).toString();
      }
      return undefined;
    });

    const deptLoad = async (
      res: TreeState<PamirsDepartment>,
      service: PamirsDepartmentService,
      queryWrapper: QueryWrapper
    ) => {
      return service.queryListByFilter({
        departmentCodes: props.departmentCodes,
        userDept: props.userDept,
        userDeptAndChildren: props.userDeptAndChildren
      });
    };

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

    const onDepartmentSelected = async ({ selectedKeys }: { selectedKeys: string[] }) => {
      if (selectedKeys.length) {
        const deptCode = selectedKeys[0].substring(OrganizationalStructureType.department.length + 1);
        const rsql = RSQLCondition.wrapper()
          .eq('departmentCode', deptCode)
          .or((v) => v.eq('departmentList.code', deptCode))
          .toString();
        await $$searchEmployeeList(employeeListRef.value!, rsql);
      } else {
        await $$initEmployeeList(employeeListRef.value!);
      }
    };

    const onDeploymentSelectedAllEmployee = () => {
      onDepartmentSelected({ selectedKeys: [] });
      currentState.value.departmentSelectedKeys = [];
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
      employeeListRef,
      state,
      currentState,
      deptDomain,
      deptLoad,
      deptEmployeeLoad,
      onDepartmentSelected,
      onDeploymentSelectedAllEmployee
    };
  },
  render() {
    const {
      $translate,
      mode,
      initCheckedKeys,
      onInit,
      domain,

      state,
      currentState,
      deptDomain,
      deptLoad,
      deptEmployeeLoad,
      onDepartmentSelected,
      onDeploymentSelectedAllEmployee
    } = this;
    return createVNode('div', { class: 'oio-department-employee-selected-panel' }, [
      createVNode('div', { class: 'oio-department-selected-wrapper oio-scrollbar' }, [
        createVNode('div', { class: 'oio-department-selected-all-employee-node' }, [
          createVNode(
            'div',
            {
              class: [
                'oio-department-selected-all-employee-node-content-wrapper',
                !currentState.departmentSelectedKeys.length && 'oio-department-selected-all-employee-node-selected'
              ],
              onClick: onDeploymentSelectedAllEmployee
            },
            $translate('全部员工')
          )
        ]),
        createVNode(OrganizationalStructureTree, {
          autoInit: true,
          domain: deptDomain,
          load: deptLoad,
          selectable: true,
          selectedKeys: currentState.departmentSelectedKeys,
          'onUpdate:selectedKeys': (val: string[]) => (currentState.departmentSelectedKeys = val),
          onSelected: onDepartmentSelected
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
        load: deptEmployeeLoad,
        domain,
        initCheckedKeys,
        checkedKeys: state.checkedKeys,
        onInit,
        'onUpdate:loading': (val: boolean) => (state.loading = val),
        'onUpdate:checkedKeys': (keys: string[]) => (state.checkedKeys = keys)
      })
    ]);
  }
});
</script>
<style lang="scss">
.oio-department-employee-selected-panel {
  height: 400px;
  position: relative;
  display: flex;

  .oio-department-selected-wrapper {
    width: 50%;
    flex-basis: 50%;
    padding-right: 8px;
    overflow: auto;
    display: flex;
    flex-direction: column;

    .oio-department-selected-all-employee-node {
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

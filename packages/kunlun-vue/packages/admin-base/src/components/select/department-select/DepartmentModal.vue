<script lang="ts">
import { OrganizationalStructureType, type PamirsDepartment, type PamirsDepartmentService, type PamirsOrganizationalStructure, QueryWrapper } from '@oinone/kunlun-engine';
import { CastHelper, OioEmptyData, OioInput, OioInputSearch, OioModal, OioModalProps, OioSelectItem, OioTab, OioTabs, type OioTreeNode, PropRecordHelper, SelectMode, StringHelper } from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, type PropType, reactive, type VNode, watch } from 'vue';
import { CheckedHelper, type TreeState } from '../../quick-utils';
import { BaseSelect } from '../base';
import { OrganizationalStructureTree } from '../organizational-structure-tree';
import DepartmentTree from './DepartmentTree.vue';

interface BaseState {
  init: boolean;
  storage: Record<string, OioTreeNode<PamirsDepartment>>;
}

interface State extends BaseState {
  loading: boolean;
  searchValue: string;
  checkedKeys: string[];
}

export default defineComponent({
  name: 'DepartmentModal',
  components: {
    OioInput,
    OioModal,
    OioTab,
    OioTabs,
    DepartmentTree,
    OrganizationalStructureTree
  },
  props: {
    ...OioModalProps,
    mode: {
      type: String as PropType<SelectMode | keyof typeof SelectMode>
    },
    selected: {
      type: [Object, Array] as PropType<
        OioSelectItem<PamirsOrganizationalStructure> | OioSelectItem<PamirsOrganizationalStructure>[]
      >
    },
    allowClear: {
      type: Boolean
    },
    model: {
      type: String
    },
    companyModel: {
      type: String
    },
    domain: {
      type: String
    },
    departmentCodes: {
      type: Array as PropType<string[]>
    },
    userCompanyDept: {
      type: Boolean,
      default: undefined
    },
    userDept: {
      type: Boolean,
      default: undefined
    },
    userDeptAndChildren: {
      type: Boolean,
      default: undefined
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const state: State = reactive({
      init: false,
      storage: {},
      loading: false,
      searchValue: '',
      checkedKeys: []
    });

    const initCheckedKeys = computed(() => {
      let checkedKeys: string[] = [];
      if (props.selected != null) {
        if (Array.isArray(props.selected)) {
          checkedKeys = props.selected.map((v) => `${OrganizationalStructureType.department}-${v.key}`);
        } else {
          checkedKeys = [`${OrganizationalStructureType.department}-${props.selected.key}`];
        }
      }
      return checkedKeys;
    });

    const selectedValues = computed(() => {
      const selectedItems: OioSelectItem<PamirsDepartment>[] = [];
      if (props.mode === SelectMode.single) {
        const checkedKey = state.checkedKeys[0];
        const node = state.storage[checkedKey];
        if (!node) {
          return selectedItems;
        }
        const { key, title, value } = node;
        selectedItems.push({
          key,
          value: key,
          label: title || '-',
          data: value
        });
        return selectedItems;
      }
      for (const checkedKey of state.checkedKeys) {
        const node = state.storage[checkedKey];
        if (!node || !node.isLeaf) {
          continue;
        }
        const { key, title, value } = node;
        selectedItems.push({
          key,
          value: key,
          label: title || '-',
          data: value
        });
      }
      return selectedItems;
    });

    const load = async (
      res: TreeState<PamirsDepartment>,
      service: PamirsDepartmentService,
      queryWrapper: QueryWrapper
    ) => {
      try {
        return await service.queryListByFilter({
          model: props.model,
          rsql: queryWrapper.rsql,
          departmentCodes: props.departmentCodes,
          userCompanyDept: props.userCompanyDept,
          userDept: props.userDept,
          userDeptAndChildren: props.userDeptAndChildren
        });
      } catch (e) {
        state.init = true;
        state.loading = false;
        throw e;
      }
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

    const onUpdateState = (key: string, value: unknown) => {
      state[key] = value;
    };

    const onInit = (res: TreeState<PamirsDepartment>) => {
      state.init = true;
      state.storage = res.storage;
      state.checkedKeys = res.checkedKeys;
    };

    const userDepartmentTreeState: BaseState = reactive({
      init: false,
      storage: {}
    });

    const userDepartmentTreeLoad = async (
      res: TreeState<PamirsDepartment>,
      service: PamirsDepartmentService,
      queryWrapper: QueryWrapper
    ) => {
      try {
        const userCompanyDept = props.userCompanyDept || false;
        let userDept = props.userDept || false;
        const userDeptAndChildren = props.userDeptAndChildren || false;
        if (!userCompanyDept && !userDept && !userDeptAndChildren) {
          userDept = true;
        }
        return await service.queryListByFilter({
          model: props.model,
          rsql: queryWrapper.rsql,
          userCompanyDept,
          userDept,
          userDeptAndChildren
        });
      } catch (e) {
        state.init = true;
        state.loading = false;
        throw e;
      }
    };

    const onInitUserDepartmentTree = (res: TreeState<PamirsDepartment>) => {
      userDepartmentTreeState.init = true;
      userDepartmentTreeState.storage = res.storage;
    };

    const onUpdateCheckedKeysByUserDepartmentTree = (checkedKeys: string[]) => {
      state.checkedKeys = CheckedHelper.diffTreeCheckedKeys(
        state.storage,
        userDepartmentTreeState.storage,
        state.checkedKeys,
        checkedKeys
      );
    };

    watch(
      () => props.visible,
      (val) => {
        if (val) {
          state.init = false;
          userDepartmentTreeState.init = false;
        }
      }
    );

    return {
      state,
      selectedValues,
      initCheckedKeys,
      load,
      enterCallback,
      onUpdateState,
      onInit,

      userDepartmentTreeState,
      userDepartmentTreeLoad,
      onInitUserDepartmentTree,
      onUpdateCheckedKeysByUserDepartmentTree
    };
  },
  render() {
    const {
      $translate,
      mode,
      allowClear,
      model,
      companyModel,
      domain,
      departmentCodes,
      userCompanyDept,
      userDept,
      userDeptAndChildren,

      state,
      selectedValues,
      initCheckedKeys,
      load,
      enterCallback,
      onUpdateState,
      onInit,

      userDepartmentTreeLoad,
      onInitUserDepartmentTree,
      onUpdateCheckedKeysByUserDepartmentTree
    } = this;
    return createVNode(
      OioModal,
      {
        title: $translate('选择部门'),
        width: '720px',
        maskClosable: false,
        ...PropRecordHelper.convert(OioModalProps, CastHelper.cast(this)),
        wrapperClassName: StringHelper.append(
          ['oio-department-modal', 'vxe-table--ignore-clear'],
          this.wrapperClassName
        ),
        destroyOnClose: true,
        loading: state.loading,
        enterCallback
      },
      {
        default: () => {
          if (state.init && !Object.keys(state.storage).length) {
            return createVNode(OioEmptyData);
          }
          const treeProps = {
            searchValue: state.searchValue,
            selectMode: mode,
            showCheckedAll: true,
            loading: state.loading,
            usingLoading: false,
            autoInit: true,
            model,
            companyModel,
            domain,
            userCompanyDept,
            userDept,
            userDeptAndChildren,
            initCheckedKeys,
            checkedKeys: state.checkedKeys,
            load,
            onInit,
            'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
            'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
          };
          const tabs: { key: string; label: string }[] = [];
          const vNodes: VNode[] = [];
          const pushMainTree = () => {
            tabs.push({
              key: 'organizational-structure-tree',
              label: '组织架构'
            });
            vNodes.push(createVNode(OrganizationalStructureTree, treeProps));
          };
          let showFullPanel = false;
          let usingUserDepartmentTree = userCompanyDept || userDept || userDeptAndChildren;
          if (!usingUserDepartmentTree && !departmentCodes?.length) {
            showFullPanel = true;
            usingUserDepartmentTree = true;
          }
          if (usingUserDepartmentTree) {
            if (showFullPanel || departmentCodes?.length) {
              pushMainTree();
              vNodes.push(
                createVNode(OrganizationalStructureTree, {
                  searchValue: state.searchValue,
                  selectMode: mode,
                  showCheckedAll: true,
                  loading: state.loading,
                  usingLoading: false,
                  autoInit: true,
                  model,
                  companyModel,
                  domain,
                  userCompanyDept,
                  userDept,
                  userDeptAndChildren,
                  checkedKeys: state.checkedKeys,
                  load: userDepartmentTreeLoad,
                  onInit: onInitUserDepartmentTree,
                  'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
                  'onUpdate:checkedKeys': onUpdateCheckedKeysByUserDepartmentTree
                })
              );
            } else {
              vNodes.push(createVNode(OrganizationalStructureTree, treeProps));
            }
            tabs.push({
              key: 'user-department-tree',
              label: '当前用户所在部门'
            });
          } else {
            pushMainTree();
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
            createVNode('div', { class: 'oio-department-modal-content' }, [
              createVNode(BaseSelect, {
                mode: SelectMode.multiple,
                value: selectedValues,
                allowClear,
                placeholder: $translate('选择部门'),
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
.oio-department-modal {
  .oio-department-modal-content {
    display: flex;
    flex-direction: column;
    row-gap: 16px;

    & > .oio-organizational-structure-tree,
    & > .oio-organizational-structure-tree-wrapper {
      height: 400px;
      overflow: auto;
    }
  }

  .oio-tab-content {
    height: 400px;
    overflow: auto;
  }
}
</style>

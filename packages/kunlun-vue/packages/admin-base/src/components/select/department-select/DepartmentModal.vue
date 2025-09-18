<script lang="ts">
import { PamirsDepartment } from '@oinone/kunlun-engine';
import {
  CastHelper,
  OioInput,
  OioInputSearch,
  OioModal,
  OioModalProps,
  OioTab,
  OioTabs,
  OioTreeNode,
  PropRecordHelper,
  SelectItem,
  SelectMode
} from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, PropType, reactive, VNode } from 'vue';
import { TreeState } from '../../quick-utils';
import { BaseSelect } from '../base';
import DepartmentTree from './DepartmentTree.vue';

interface State {
  storage: Record<string, OioTreeNode<PamirsDepartment>>;
  loading: boolean;
  searchValue: string;
  checkedKeys: string[];
}

interface TabOption {
  key: string;
  label: string;
}

function createTabTitleList(): TabOption[] {
  return [
    {
      key: 'all',
      label: '所有部门'
    }
  ];
}

export default defineComponent({
  name: 'DepartmentModal',
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
      type: [Object, Array] as PropType<SelectItem<PamirsDepartment> | SelectItem<PamirsDepartment>[]>
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
      const selectedItems: SelectItem<PamirsDepartment>[] = [];
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
      state.storage = res.storage;
      state.checkedKeys = res.checkedKeys;
    };

    return {
      state,
      selectedValues,
      initCheckedKeys,
      enterCallback,
      onUpdateState,
      onInit
    };
  },
  render() {
    const {
      $translate,
      mode,
      userDept,
      userDeptAndChildren,

      state,
      selectedValues,
      initCheckedKeys,
      enterCallback,
      onUpdateState,
      onInit
    } = this;
    const tabTitleList: TabOption[] = createTabTitleList();
    const tabList: VNode[] = [];
    tabList.push(
      createVNode(DepartmentTree, {
        searchValue: state.searchValue,
        selectMode: mode,
        showCheckedAll: true,
        loading: state.loading,
        usingLoading: false,
        autoInit: true,
        initCheckedKeys,
        checkedKeys: state.checkedKeys,
        onInit,
        'onUpdate:loading': (val: boolean) => onUpdateState('loading', val),
        'onUpdate:checkedKeys': (keys: string[]) => onUpdateState('checkedKeys', keys)
      })
    );
    if (userDept) {
      tabTitleList.push({
        key: 'userDept',
        label: '当前用户所处部门'
      });
      tabList.push(
        createVNode(DepartmentTree, {
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
        label: '当前用户所处部门及下级部门'
      });
      tabList.push(
        createVNode(DepartmentTree, {
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
        title: $translate('选择部门'),
        wrapperClassName: 'oio-department-modal',
        width: '720px',
        height: '664px',
        maskClosable: false,
        ...PropRecordHelper.convert(OioModalProps, CastHelper.cast(this)),
        destroyOnClose: true,
        loading: state.loading,
        enterCallback
      },
      {
        default: () => {
          return [
            createVNode('div', { class: 'oio-department-modal-content' }, [
              createVNode(BaseSelect, {
                mode: SelectMode.multiple,
                value: selectedValues,
                options: selectedValues,
                placeholder: $translate('选择部门'),
                notFoundContent: null,
                allowArrow: false
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
.oio-department-modal {
  .ant-modal-body {
    overflow-x: hidden;

    & > .oio-spin-wrapper {
      height: 100%;

      & > .ant-spin-container {
        height: 100%;
      }
    }
  }

  .oio-department-modal-content {
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    height: 100%;

    & > .oio-tabs,
    & > .oio-department-tree-wrapper,
    & > .oio-department-tree {
      flex: 1;
    }
  }
}
</style>

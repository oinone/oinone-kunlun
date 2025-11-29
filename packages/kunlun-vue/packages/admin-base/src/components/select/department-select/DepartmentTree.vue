<script lang="ts">
import { PamirsDepartment } from '@oinone/kunlun-engine';
import { OioTreeNode } from '@oinone/kunlun-shared';
import { OioCheckbox, OioIcon, OioTree, SelectMode } from '@oinone/kunlun-vue-ui-antd';
import { Radio as ARadio } from 'ant-design-vue';
import { computed, createVNode, defineComponent, onMounted, PropType, VNode } from 'vue';
import { TreeStateLoadFunction } from '../../quick-utils';
import { useDepartmentTree } from './init';

export default defineComponent({
  name: 'DepartmentTree',
  components: {
    OioTree,
    OioIcon,
    OioCheckbox,
    ARadio
  },
  props: {
    searchValue: {
      type: String
    },
    icon: {
      type: String,
      default: 'oinone-apartment-outlined'
    },
    selectMode: {
      type: String as PropType<SelectMode | keyof typeof SelectMode>
    },
    showCheckedAll: {
      type: Boolean
    },
    loading: {
      type: Boolean
    },
    usingLoading: {
      type: Boolean
    },
    autoInit: {
      type: Boolean
    },
    load: {
      type: Function as PropType<TreeStateLoadFunction<PamirsDepartment>>
    },
    domain: {
      type: String
    },
    initCheckedKeys: {
      type: Array as PropType<string[]>
    },
    checkedKeys: {
      type: Array as PropType<string[]>
    },
    selectable: {
      type: Boolean
    }
  },
  emits: ['update:loading', 'update:checkedKeys', 'init', 'change'],
  setup(props, { emit, expose }) {
    const {
      state,
      filterData,
      checkedAll,
      halfCheckedAll,
      init,
      onUpdateExpandedKeys,
      onCheckedAll,
      onCheckedStrictly
    } = useDepartmentTree({
      mode: props.selectMode,
      getCheckedKeys: () => props.checkedKeys,
      getSearchValue: () => props.searchValue,
      load: props.load
    });

    const loading = computed({
      get: () => {
        if (props.loading == null) {
          return state.loading;
        }
        return props.loading;
      },
      set: (value) => {
        emit('update:loading', value);
        state.loading = value;
      }
    });

    const onUpdateCheckedAll = (checked: boolean) => {
      onCheckedAll(filterData.value, checked);
      updateTreeData();
    };

    const onUpdateChecked = (node: OioTreeNode<PamirsDepartment>, checked: boolean) => {
      onCheckedStrictly(node, checked);
      updateTreeData();
    };

    const updateTreeData = () => {
      state.data = [...state.data];
      emit('update:checkedKeys', state.checkedKeys);
      emit('change', {
        nodes: state.checkedNodes,
        checkedKeys: state.checkedKeys
      });
    };

    if (props.autoInit) {
      onMounted(async () => {
        loading.value = true;
        try {
          const res = await init({
            rsql: props.domain,
            checkedKeys: props.initCheckedKeys || props.checkedKeys
          });
          emit('init', res);
        } finally {
          loading.value = false;
        }
      });
    }

    expose({
      state,
      filterData,
      checkedAll,
      halfCheckedAll,
      init
    });

    return {
      state,
      filterData,
      checkedAll,
      halfCheckedAll,
      onUpdateExpandedKeys,
      onUpdateCheckedAll,
      onUpdateChecked
    };
  },
  render() {
    const {
      state,
      filterData,
      checkedAll,
      halfCheckedAll,
      icon,

      loading,
      usingLoading,
      selectMode,
      showCheckedAll,
      selectable,
      onUpdateExpandedKeys,
      onUpdateCheckedAll,
      onUpdateChecked
    } = this;
    const treeProps: Record<string, unknown> = {
      class: 'oio-department-tree oio-scrollbar',
      data: filterData,
      blockNode: true,
      selectable: selectable || false,
      expandedKeys: state.expandedKeys,
      'onUpdate:expandedKeys': onUpdateExpandedKeys
    };
    if (usingLoading) {
      treeProps.loading = loading;
    }
    const treeNode = createVNode(OioTree, treeProps, {
      title: ({ title, key, dataRef }) => {
        const nodes: VNode[] = [];
        if (icon) {
          nodes.push(
            createVNode('div', { class: 'oio-department-tree-node-title' }, [
              createVNode(OioIcon, {
                icon,
                color: 'var(--oio-primary-color)'
              }),
              createVNode('span', {}, title)
            ])
          );
        } else {
          nodes.push(createVNode('div', { class: 'oio-department-tree-node-title' }, [createVNode('span', {}, title)]));
        }
        if (selectMode === SelectMode.multiple) {
          nodes.push(
            createVNode(OioCheckbox, {
              checked: dataRef.checked,
              indeterminate: dataRef.halfChecked,
              'onUpdate:checked': (val: boolean) => onUpdateChecked(dataRef, val)
            })
          );
        } else if (selectMode === SelectMode.single) {
          nodes.push(
            createVNode(ARadio, {
              class: 'oio-radio',
              checked: key === state.checkedKeys[0],
              'onUpdate:checked': (val: boolean) => onUpdateChecked(dataRef, key !== state.checkedKeys[0])
            })
          );
        }
        return [createVNode('div', { class: 'oio-department-tree-node' }, nodes)];
      }
    });
    if (selectable) {
      return treeNode;
    }
    if (!!filterData.length && selectMode === SelectMode.multiple && showCheckedAll) {
      return createVNode('div', { class: 'oio-department-tree-wrapper oio-scrollbar' }, [
        createVNode('div', { class: 'oio-department-tree-node oio-department-tree-node-checked-all' }, [
          createVNode('div', { class: 'oio-department-tree-node-title' }, '全选'),
          createVNode(OioCheckbox, {
            checked: checkedAll,
            indeterminate: halfCheckedAll,
            'onUpdate:checked': onUpdateCheckedAll
          })
        ]),
        treeNode
      ]);
    }
    return treeNode;
  }
});
</script>
<style lang="scss">
.oio-department-tree,
.oio-department-tree-wrapper {
  .oio-department-tree-node {
    display: flex;
    justify-content: space-between;

    .oio-department-tree-node-title {
      display: flex;
      align-items: center;
      column-gap: 8px;
    }

    &.oio-department-tree-node-checked-all {
      height: 28px;
      padding: 0 4px 4px;
    }
  }
}
</style>

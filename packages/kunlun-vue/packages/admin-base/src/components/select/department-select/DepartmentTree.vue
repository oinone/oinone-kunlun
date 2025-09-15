<script lang="ts">
import { PamirsDepartment } from '@oinone/kunlun-engine';
import { OioTreeNode } from '@oinone/kunlun-shared';
import { OioCheckbox, OioIcon, OioTree, SelectMode } from '@oinone/kunlun-vue-ui-antd';
import { Radio as ARadio } from 'ant-design-vue';
import { computed, createVNode, defineComponent, onMounted, PropType, VNode } from 'vue';
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
    autoInit: {
      type: Boolean
    },
    domain: {
      type: String
    }
  },
  emits: ['update:checkedKeys'],
  setup(props, { emit, expose }) {
    const { state, init, updateCheckedAllState, onCheckedAll, onCheckedStrictly } = useDepartmentTree({
      mode: props.selectMode
    });

    const filterData = computed(() => {
      const searchValue = props.searchValue;
      if (searchValue) {

      }
      return state.data;
    });

    const onUpdateExpandedKeys = (keys: string[]) => {
      state.expandedKeys = keys;
    };

    const onUpdateCheckedAll = (checked: boolean) => {
      onCheckedAll(state.data, checked);
      state.checkedAll = checked;
      state.halfCheckedAll = false;
      updateTreeData();
    };

    const onUpdateChecked = (node: OioTreeNode<PamirsDepartment>, checked: boolean) => {
      onCheckedStrictly(node, checked);
      if (props.selectMode === SelectMode.multiple) {
        updateCheckedAllState();
      }
      updateTreeData();
    };

    const updateTreeData = () => {
      state.data = [...state.data];
      emit('update:checkedKeys', state.checkedKeys);
    };

    if (props.autoInit) {
      onMounted(() => {
        init();
      });
    }

    expose({
      init
    });

    return {
      state,
      filterData,
      onUpdateExpandedKeys,
      onUpdateCheckedAll,
      onUpdateChecked
    };
  },
  render() {
    const {
      state,
      icon,
      filterData,

      selectMode,
      showCheckedAll,
      onUpdateExpandedKeys,
      onUpdateCheckedAll,
      onUpdateChecked
    } = this;
    const treeNode = createVNode(
      OioTree,
      {
        class: 'oio-department-tree oio-scrollbar',
        data: filterData,
        blockNode: true,
        selectable: false,
        expandedKeys: state.expandedKeys,
        'onUpdate:expandedKeys': onUpdateExpandedKeys
      },
      {
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
            nodes.push(
              createVNode('div', { class: 'oio-department-tree-node-title' }, [createVNode('span', {}, title)])
            );
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
      }
    );
    if (selectMode === SelectMode.multiple && showCheckedAll) {
      return createVNode('div', { class: 'oio-department-tree-wrapper' }, [
        createVNode('div', { class: 'oio-department-tree-node oio-department-tree-node-checked-all' }, [
          createVNode('div', { class: 'oio-department-tree-node-title' }, '全选'),
          createVNode(OioCheckbox, {
            checked: state.checkedAll,
            indeterminate: state.halfCheckedAll,
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

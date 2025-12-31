<script lang="ts">
import { OrganizationalStructureType, PamirsDepartment, PamirsOrganizationalStructure } from '@oinone/kunlun-engine';
import { OioTreeNode } from '@oinone/kunlun-shared';
import { OioCheckbox, OioIcon, OioTree, SelectMode } from '@oinone/kunlun-vue-ui-antd';
import { Radio as ARadio } from 'ant-design-vue';
import { computed, createVNode, defineComponent, onMounted, PropType, VNode } from 'vue';
import { TreeStateLoadFunction } from '../../quick-utils';
import { useOrganizationalStructureTree } from './init';

export default defineComponent({
  name: 'OrganizationalStructureTree',
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
    companyIcon: {
      type: String,
      default: 'oinone-company-outlined'
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
      type: Function as PropType<TreeStateLoadFunction<PamirsOrganizationalStructure>>
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
    },
    selectedKeys: {
      type: Array as PropType<string[]>
    }
  },
  emits: ['update:loading', 'update:checkedKeys', 'update:selectedKeys', 'init', 'change'],
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
    } = useOrganizationalStructureTree({
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
      companyIcon,
      icon,

      loading,
      usingLoading,
      selectMode,
      showCheckedAll,
      selectable,
      selectedKeys,
      onUpdateExpandedKeys,
      onUpdateCheckedAll,
      onUpdateChecked
    } = this;
    const mainClassName = 'oio-organizational-structure-tree';
    const treeProps: Record<string, unknown> = {
      class: `${mainClassName} oio-scrollbar`,
      data: filterData,
      blockNode: true,
      selectable: selectable || false,
      selectedKeys,
      'onUpdate:selectedKeys': (val) => this.$emit('update:selectedKeys', val),
      expandedKeys: state.expandedKeys,
      'onUpdate:expandedKeys': onUpdateExpandedKeys
    };
    if (usingLoading) {
      treeProps.loading = loading;
    }
    const treeNode = createVNode(OioTree, treeProps, {
      title: ({ title, key, dataRef }) => {
        const nodes: VNode[] = [];
        const titleNodes: VNode[] = [];
        if (dataRef.value.type === OrganizationalStructureType.company && companyIcon) {
          titleNodes.push(
            createVNode(OioIcon, {
              icon: companyIcon,
              color: 'var(--oio-primary-color)'
            })
          );
        } else if (icon) {
          titleNodes.push(
            createVNode(OioIcon, {
              icon,
              color: 'var(--oio-primary-color)'
            })
          );
        }
        titleNodes.push(createVNode('span', {}, title));
        nodes.push(createVNode('div', { class: `${mainClassName}-node-title` }, titleNodes));
        if (selectMode === SelectMode.multiple) {
          nodes.push(
            createVNode(OioCheckbox, {
              checked: dataRef.checked,
              indeterminate: dataRef.halfChecked,
              onClick: () => onUpdateChecked(dataRef, dataRef.checked !== true)
            })
          );
        } else if (dataRef.selectable !== false && selectMode === SelectMode.single) {
          nodes.push(
            createVNode(ARadio, {
              class: 'oio-radio',
              checked: key === state.checkedKeys[0],
              onClick: () => onUpdateChecked(dataRef, key !== state.checkedKeys[0])
            })
          );
        }
        return [
          createVNode('div', { class: `${mainClassName}-node ${mainClassName}-${dataRef.value.type}-node` }, nodes)
        ];
      }
    });
    if (selectable) {
      return treeNode;
    }
    if (!!filterData.length && selectMode === SelectMode.multiple && showCheckedAll) {
      return createVNode('div', { class: `${mainClassName}-wrapper oio-scrollbar` }, [
        createVNode('div', { class: `${mainClassName}-node ${mainClassName}-node-checked-all` }, [
          createVNode('div', { class: `${mainClassName}-node-title` }, '全选'),
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
.oio-organizational-structure-tree,
.oio-organizational-structure-tree-wrapper {
  .oio-organizational-structure-tree-node {
    display: flex;
    justify-content: space-between;

    .oio-organizational-structure-tree-node-title {
      display: flex;
      align-items: center;
      column-gap: 8px;
    }

    &.oio-organizational-structure-tree-node-checked-all {
      height: 28px;
      padding: 0 4px 4px;
    }
  }
}
</style>

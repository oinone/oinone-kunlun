<script lang="ts">
import {
  BooleanHelper,
  ButtonType,
  defaultTreeSelectProperties,
  OioButton,
  OioTreeNode,
  OioTreeSelect,
  SimpleTreeSelected,
  TreeSelectNode,
  TreeSelectNodeChangeEvent,
  TreeSelectProperties
} from '@kunlun/vue-ui-antd';
import { computed, createVNode, defineComponent, PropType, VNode, withModifiers } from 'vue';
import { OioCommonProps, OioMetadataProps, useInjectOioDefaultFormContext } from '../../basic';
import { TreeData } from '../../typing';
import { TreeUtils } from '../../util';

const mappingProperties: TreeSelectProperties = {
  ...defaultTreeSelectProperties,
  labelProp: 'title',
  valueProp: 'key'
};

export default defineComponent({
  name: 'DefaultTreeSelect',
  components: {
    OioTreeSelect
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    maxTagCount: {
      type: Number
    },
    selectedValue: {
      type: [Object, Array] as PropType<SimpleTreeSelected | SimpleTreeSelected[]>
    },
    placeholder: {
      type: String
    },
    allowClear: {
      type: Boolean,
      default: undefined
    },
    rootNode: {
      type: Object as PropType<OioTreeNode<TreeData>>
    },
    searchRootNode: {
      type: Object as PropType<OioTreeNode<TreeData>>
    },
    expandedKeys: {
      type: Array as PropType<string[]>
    },
    onUpdateExpandedKeys: {
      type: Function as PropType<(val: string[]) => void>
    },
    selectMode: {
      type: String
    },
    multipleCheckedStrategy: {
      type: String
    },
    treeCheckStrictly: {
      type: Boolean,
      default: undefined
    },
    loading: {
      type: Boolean,
      default: undefined
    },
    enableSearch: {
      type: Boolean,
      default: undefined
    },
    enableLoadData: {
      type: Boolean,
      default: undefined
    },
    onlySelectedLeaf: {
      type: Boolean,
      default: false
    },
    loadData: {
      type: Function as PropType<(node: OioTreeNode<TreeData>) => Promise<void>>
    },
    loadMoreData: {
      type: Function as PropType<(node: OioTreeNode<TreeData>) => Promise<void>>
    },
    onSelectedChange: {
      type: Function as PropType<
        (selectedValue: SimpleTreeSelected | SimpleTreeSelected[], event: TreeSelectNodeChangeEvent) => void
      >
    },
    onSearch: {
      type: Function as PropType<(keyword: string) => void>
    }
  },
  setup(props) {
    const treeData = computed(() => {
      const searchChildren = props.searchRootNode?.children;
      if (searchChildren) {
        return [...searchChildren];
      }
      return TreeUtils.fillLoadMoreAction([...(props.rootNode?.children || [])]);
    });

    const readonly = computed<boolean>(() => BooleanHelper.toBoolean(props.readonly) || false);

    const disabled = computed<boolean>(() => BooleanHelper.toBoolean(props.disabled) || false);

    const loadData = async ({ dataRef }: { dataRef: TreeSelectNode<OioTreeNode<TreeData>> }) => {
      const targetOption = dataRef.data;
      if (!targetOption.loaded) {
        return props.loadData?.(targetOption);
      }
    };

    const onDropdownVisibleChange = (visible: boolean) => {
      if (visible) {
        if (props.rootNode && !props.rootNode.loaded) {
          props.loadData?.(props.rootNode);
        }
      }
    };

    const onChange = (selectedValue: SimpleTreeSelected | SimpleTreeSelected[], event: TreeSelectNodeChangeEvent) => {
      props.onSelectedChange?.(selectedValue, event);
    };

    const onSearch = (val) => {
      props.onSearch?.(val);
    };

    const onClickLoadMore = async (node: OioTreeNode<TreeData>) => {
      const { key, parent } = node;
      const currentChildren = parent?.children;
      if (currentChildren) {
        const lastedChild = currentChildren[currentChildren.length - 2];
        node.loadingMore = true;
        try {
          await props.loadMoreData?.(lastedChild);
          let index = -1;
          for (let i = currentChildren.length - 1; i >= 0; i--) {
            const child = currentChildren[i];
            if (child.key === key) {
              index = i;
              break;
            }
          }
          if (index !== -1) {
            currentChildren.splice(index, 1);
          }
        } finally {
          node.loadingMore = false;
        }
      }
    };

    const formContext = useInjectOioDefaultFormContext();

    return {
      treeData,
      readonly,
      disabled,
      loadData,
      onDropdownVisibleChange,
      onChange,
      onSearch,
      onClickLoadMore,

      getTriggerContainer: formContext.getTriggerContainer
    };
  },
  render() {
    const {
      treeData,
      selectMode,
      selectedValue,
      readonly,
      disabled,
      placeholder,
      allowClear,
      multipleCheckedStrategy,
      treeCheckStrictly,
      loading,
      enableSearch,
      enableLoadData,
      onlySelectedLeaf,
      maxTagCount,

      loadData,
      onDropdownVisibleChange,
      onChange,
      onSearch,
      onClickLoadMore,
      focus,
      blur,
      getTriggerContainer
    } = this;
    return createVNode(
      OioTreeSelect,
      {
        mode: selectMode,
        value: selectedValue,
        options: treeData,
        expandedKeys: this.expandedKeys,
        properties: mappingProperties,
        maxTagCount,
        enableSearch,
        loading,
        loadData: enableLoadData ? loadData : undefined,
        getTriggerContainer,
        readonly,
        disabled,
        placeholder,
        allowClear,
        multipleCheckedStrategy,
        treeCheckStrictly,
        'onUpdate:expandedKeys': this.onUpdateExpandedKeys,
        onChange,
        onSearch: enableLoadData ? onSearch : undefined,
        onFocus: focus,
        onBlur: blur,
        onDropdownVisibleChange
      },
      {
        title: ({
          label,
          data,
          dataRef
        }: {
          label: string;
          data: OioTreeNode<TreeData>;
          dataRef?: OioTreeNode<TreeData>;
        }) => {
          const nodeChildren: string | VNode[] = label;
          const finalDataRef = dataRef || data;
          if (finalDataRef?.class === TreeUtils.LOAD_MORE_NODE_CLASS_NAME) {
            return [
              createVNode(
                OioButton,
                {
                  type: ButtonType.link,
                  loading: finalDataRef.loadingMore,
                  onMouseover: withModifiers(() => {}, ['stop', 'prevent']),
                  onMouseout: withModifiers(() => {}, ['stop', 'prevent']),
                  onMouseenter: withModifiers(() => {}, ['stop', 'prevent']),
                  onMouseleave: withModifiers(() => {}, ['stop', 'prevent']),
                  onClick: withModifiers(() => onClickLoadMore(finalDataRef), ['stop', 'prevent'])
                },
                {
                  default: () => nodeChildren
                }
              )
            ];
          }

          const { data: nodeData } = (finalDataRef || {}) as unknown as TreeData;
          const isParentNode = onlySelectedLeaf && !nodeData?.isLeaf;
          return createVNode(
            'div',
            {
              onClick: (e) => {
                // 只能选中最后一个节点，但是点击的不是最后一个节点，那么就要阻止点击
                if (isParentNode) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }
            },
            nodeChildren
          );
        }
      }
    );
  }
});
</script>

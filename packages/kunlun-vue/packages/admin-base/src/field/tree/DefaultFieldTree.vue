<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { ViewType } from '@oinone/kunlun-meta';
import {
  ButtonType,
  CastHelper,
  InputSearchEvent,
  OioButton,
  OioIcon,
  OioInputSearch,
  OioTree,
  OioTreeNode,
  PropRecordHelper,
  StringHelper,
  StyleHelper
} from '@oinone/kunlun-vue-ui-antd';
import { isBoolean, isNil } from 'lodash-es';
import {
  computed,
  createVNode,
  defineComponent,
  PropType,
  ref,
  VNode,
  vShow,
  withDirectives,
  withModifiers
} from 'vue';
import { ActionBar } from '../../tags';
import { TreeData } from '../../typing';
import { TreeUtils } from '../../util';
import { DefaultTreeProps } from '../../view/tree/props';

const SelectAllKey = TreeUtils.SELECT_ALL_KEY;

export default defineComponent({
  name: 'DefaultFieldTree',
  components: {
    OioTree,
    OioInputSearch
  },
  inheritAttrs: false,
  props: {
    ...DefaultTreeProps,
    viewType: {
      type: String as PropType<ViewType>
    },
    template: {
      type: Object as PropType<DslDefinition>
    },
    autoExpandParent: {
      type: Boolean
    },
    showIcon: {
      type: Boolean
    }
  },
  setup(props) {
    const treeData = computed(() => {
      const treeNodeList: OioTreeNode<TreeData>[] = [];
      if (props.checkAll) {
        treeNodeList.push({
          isLeaf: true,
          title: translateValueByKey(props.checkAllLabel),
          class: TreeUtils.SELECT_ALL_CLASS_NAME,
          key: SelectAllKey,
          value: {} as TreeData
        } as OioTreeNode<TreeData>);
      }
      const searchChildren = props.searchRootNode?.children;
      if (searchChildren) {
        treeNodeList.push(...searchChildren);
        return treeNodeList;
      }
      treeNodeList.push(...TreeUtils.fillLoadMoreAction([...(props.rootNode?.children || [])]));
      return treeNodeList;
    });

    const isSameModel = computed(() => {
      let model: string | undefined;
      let metadata = props.rootNode?.value?.metadata;
      while (metadata) {
        const nodeModel = metadata.model;
        if (nodeModel) {
          if (model) {
            if (model !== nodeModel) {
              return false;
            }
          } else {
            model = nodeModel;
          }
        }
        metadata = metadata.child;
      }
      return !!model;
    });

    const internalExpandedKeys = ref<string[]>([]);
    const expandedKeys = computed({
      get() {
        return props.expandedKeys || internalExpandedKeys.value;
      },
      set(val: string[]) {
        internalExpandedKeys.value = val;
        props.onUpdateExpandedKeys?.(val);
      }
    });

    const onUpdateExpandedKeys = (val: string[]) => {
      expandedKeys.value = val;
    };

    const internalSelectedKeys = ref<string[]>([]);
    const selectedKeys = computed({
      get() {
        return props.selectedKeys || internalSelectedKeys.value;
      },
      set(val: string[]) {
        internalSelectedKeys.value = val;
        props.onUpdateSelectedKeys?.(val);
      }
    });

    const onUpdateSelectedKeys = (val: string[]) => {
      selectedKeys.value = val;
    };

    const internalCheckedKeys = ref<string[]>([]);
    const checkedKeys = computed({
      get() {
        return props.checkedKeys || internalCheckedKeys.value;
      },
      set(val: string[]) {
        internalCheckedKeys.value = val;
        props.onUpdateCheckedKeys?.(val);
      }
    });

    const internalHalfCheckedKeys = ref<string[]>([]);
    const halfCheckedKeys = computed({
      get() {
        return props.halfCheckedKeys || internalHalfCheckedKeys.value;
      },
      set(val: string[]) {
        internalHalfCheckedKeys.value = val;
        props.onUpdateHalfCheckedKeys?.(val);
      }
    });

    const finalCheckedKeys = computed(() => ({
      checked: checkedKeys.value,
      halfChecked: halfCheckedKeys.value
    }));

    const onUpdateCheckedKeys = ({ checked, halfChecked }: { checked: string[]; halfChecked: string[] }) => {
      checkedKeys.value = checked;
      internalHalfCheckedKeys.value = halfChecked;
    };

    const onSelected = async ({ node, selected }: { node: OioTreeNode<TreeData>; selected: boolean }) => {
      props.onSelected?.(node, selected);
    };

    const onChecked = async ({ node, checked }) => {
      props.onChecked?.(node, checked);
    };

    const onSearch = ({ value }: InputSearchEvent) => {
      props.onSearch?.(value);
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

    const nodeCheckedAll = (node: OioTreeNode<TreeData>) => {
      const nodeCheckedAll = props.nodeCheckedAll;
      if (isNil(nodeCheckedAll)) {
        return false;
      }
      if (isBoolean(nodeCheckedAll)) {
        return nodeCheckedAll;
      }
      return nodeCheckedAll(node);
    };

    return {
      treeData,
      isSameModel,

      selectedKeys,
      expandedKeys,
      checkedKeys,
      finalCheckedKeys,
      onUpdateSelectedKeys,
      onUpdateExpandedKeys,
      onUpdateCheckedKeys,
      onSelected,
      onChecked,
      onSearch,
      onClickLoadMore,
      nodeCheckedAll
    };
  },
  render() {
    const treeComponent = createVNode(
      OioTree,
      {
        key: this.rootNode?.key,
        data: this.treeData,
        loading: this.loading,
        wrapperClassName: 'default-tree-wrapper',
        selectable: this.selectable,
        checkable: this.checkable,
        checkStrictly: this.checkStrictly,
        expandedKeys: this.expandedKeys,
        selectedKeys: this.selectedKeys,
        checkedKeys: this.finalCheckedKeys,
        loadData: this.loadData,
        blockNode: true,
        autoExpandParent: this.autoExpandParent,
        showIcon: this.showIcon,
        'onUpdate:expandedKeys': this.onUpdateExpandedKeys,
        'onUpdate:selectedKeys': this.onUpdateSelectedKeys,
        'onUpdate:checkedKeys': this.onUpdateCheckedKeys,
        onSelected: this.onSelected,
        onChecked: this.onChecked
      },
      {
        title: ({ title, dataRef }) => {
          let nodeChildren: string | VNode[] = title;
          if (!dataRef.isLeaf && this.nodeCheckedAll(dataRef)) {
            nodeChildren = [
              createVNode('div', { class: 'default-tree-node-title-wrapper' }, [
                createVNode('div', { class: 'default-tree-node-title' }, title),
                createVNode(
                  'div',
                  {
                    class: 'default-tree-node-title-actions',
                    onClick: withModifiers(() => {}, ['stop', 'prevent'])
                  },
                  [
                    createVNode(
                      OioButton,
                      {
                        type: ButtonType.link,
                        onClick: withModifiers(() => this.onNodeCheckedAll?.(dataRef, true), ['stop', 'prevent'])
                      },
                      {
                        default: () => {
                          return translateValueByKey(this.nodeCheckedAllLabel);
                        }
                      }
                    ),
                    createVNode(
                      OioButton,
                      {
                        type: ButtonType.link,
                        onClick: withModifiers(() => this.onNodeCheckedAll?.(dataRef, false), ['stop', 'prevent'])
                      },
                      {
                        default: () => {
                          return translateValueByKey(this.nodeUncheckedAllLabel);
                        }
                      }
                    )
                  ]
                )
              ])
            ];
          }
          if (dataRef?.class === TreeUtils.LOAD_MORE_NODE_CLASS_NAME) {
            return [
              createVNode(
                OioButton,
                {
                  type: ButtonType.link,
                  loading: dataRef.loadingMore,
                  onMouseover: withModifiers(() => {}, ['stop', 'prevent']),
                  onMouseout: withModifiers(() => {}, ['stop', 'prevent']),
                  onMouseenter: withModifiers(() => {}, ['stop', 'prevent']),
                  onMouseleave: withModifiers(() => {}, ['stop', 'prevent']),
                  onClick: withModifiers(() => this.onClickLoadMore(dataRef), ['stop', 'prevent'])
                },
                {
                  default: () => nodeChildren
                }
              )
            ];
          }
          let rowActionsSlot = dataRef.value?.metadata?.rowActionsSlot;
          if (!rowActionsSlot && this.isSameModel) {
            rowActionsSlot = this.$slots.rowActions;
          }
          if (rowActionsSlot) {
            nodeChildren = [
              createVNode('div', { class: 'default-tree-node-wrapper' }, [
                createVNode('div', { class: 'default-tree-node-title' }, title),
                createVNode(
                  'div',
                  {
                    class: 'default-tree-node-row-actions',
                    onClick: withModifiers(() => {}, ['stop', 'prevent'])
                  },
                  [
                    createVNode(
                      ActionBar,
                      {
                        widget: 'TreeNodeActions',
                        inline: true,
                        node: dataRef
                      },
                      { default: rowActionsSlot }
                    )
                  ]
                )
              ])
            ];
          }
          return nodeChildren;
        },
        icon: ({ value }) => {
          if (!value.data?.logo) {
            return null;
          }
          return createVNode(OioIcon, { icon: value.data?.logo, size: 12, class: 'default-tree-icon' });
        }
      }
    );
    let children: VNode[] = [treeComponent];
    if (this.enableSearch) {
      children = [
        createVNode(
          'div',
          {
            class: StringHelper.append(['default-search-tree-wrapper'], CastHelper.cast(this.template?.wrapperClass)),
            style: StyleHelper.parse(this.template?.wrapperStyle)
          },
          [
            createVNode('div', { class: 'default-search-tree-input' }, [
              createVNode(OioInputSearch, {
                value: this.searchValue,
                placeholder: translateValueByKey(this.searchPlaceHolder),
                'onUpdate:value': this.onUpdateSearchValue,
                onSearch: this.onSearch
              })
            ]),
            treeComponent
          ]
        )
      ];
    }
    const classNames: string[] = ['default-field-tree'];
    if (this.viewType) {
      classNames.push(`default-tree-${this.viewType.toLowerCase()}`);
    }
    return withDirectives(
      createVNode(
        'div',
        PropRecordHelper.collectionBasicProps(
          this.$attrs,
          StringHelper.append(classNames, CastHelper.cast(this.template?.class)),
          CastHelper.cast(this.template?.style)
        ),
        children
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>

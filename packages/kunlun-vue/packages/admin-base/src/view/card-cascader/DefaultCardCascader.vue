<script lang="ts">
import { translateValueByKey } from '@oinone/kunlun-engine';
import { ButtonType, OioButton, OioInputSearch, OioSpin, OioTree } from '@oinone/kunlun-vue-ui-antd';
import { OioCard, OioCardCascader, OioTreeNode, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { isEmpty } from 'lodash-es';
import { computed, createVNode, defineComponent, PropType, VNode, vShow, withDirectives, withModifiers } from 'vue';
import { ActionBar } from '../../tags';
import { CardCascaderItemData } from '../../typing';
import { TreeUtils } from '../../util';

export default defineComponent({
  name: 'DefaultCardCascader',
  components: {
    OioCardCascader,
    OioCard
  },
  inheritAttrs: false,
  props: {
    loading: {
      type: Boolean,
      default: undefined
    },
    invisible: {
      type: Boolean,
      default: false
    },
    rootNodes: {
      type: Object as PropType<OioTreeNode<CardCascaderItemData>[]>
    },
    loadData: {
      type: Function as PropType<(node: OioTreeNode<CardCascaderItemData>) => Promise<void>>
    },
    loadMoreData: {
      type: Function as PropType<(node: OioTreeNode<CardCascaderItemData>) => Promise<void>>
    },
    onSelected: {
      type: Function as PropType<(node: OioTreeNode<CardCascaderItemData>, selected: boolean) => Promise<void>>
    },
    enableSearch: {
      type: Boolean
    },
    onSearch: {
      type: Function as PropType<(val: string, rootNode: OioTreeNode<CardCascaderItemData>) => Promise<void>>
    },
    showContent: {
      type: Boolean,
      default: false
    }
  },
  slots: ['default', 'content'],
  setup(props) {
    const rootNodesChildren = computed(() => {
      return props.rootNodes?.map((v) => TreeUtils.fillLoadMoreAction([...(v.children || [])])) || [];
    });

    const hasTitle = computed(() => {
      return props.rootNodes?.map((v) => v.title).some((v) => !!v);
    });

    const isSameModel = computed(() => {
      let model: string | undefined;
      let metadata = props.rootNodes?.[0]?.value?.metadata;
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

    const onSelected = async ({ node, selected }) => {
      props.onSelected?.(node, selected);
    };

    const onClickLoadMore = async (node: OioTreeNode<CardCascaderItemData>) => {
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

    return {
      rootNodesChildren,
      hasTitle,
      isSameModel,

      onSelected,
      onClickLoadMore
    };
  },
  render() {
    const children: VNode[] = [];
    const { rootNodes, hasTitle } = this;
    rootNodes?.forEach((rootNode, index) => {
      let { title: cardTitle } = rootNode;
      if (!hasTitle && isEmpty(cardTitle)) {
        cardTitle = undefined;
      } else {
        cardTitle = cardTitle || '';
      }
      const isTree = !!rootNode.value.metadata?.selfReferences;
      children.push(
        createVNode(
          OioCard,
          {
            key: rootNode.key,
            class: isTree ? 'default-card-cascader-card-tree' : 'default-card-cascader-card-list',
            title: cardTitle
          },
          {
            default: () => {
              const treeComponent = createVNode(
                OioTree,
                {
                  wrapperClassName: 'oio-scrollbar',
                  data: this.rootNodesChildren[index] || [],
                  loadData: this.loadData,
                  blockNode: true,
                  expandedKeys: rootNode.value.expandedKeys,
                  selectedKeys: rootNode.value.selectedKeys,
                  'onUpdate:expandedKeys': (val: string[]) => (rootNode.value.expandedKeys = val),
                  'onUpdate:selectedKeys': (val: string[]) => (rootNode.value.selectedKeys = val),
                  onSelected: this.onSelected
                },
                {
                  title: ({ title, dataRef }) => {
                    let nodeChildren: string | VNode[] = title;
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
                        createVNode('div', { class: 'default-card-cascader-node-wrapper' }, [
                          createVNode('div', { class: 'default-card-cascader-node-title' }, title),
                          createVNode(
                            'div',
                            {
                              class: 'default-card-cascader-node-row-actions',
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
                  }
                }
              );
              if (this.enableSearch) {
                return [
                  createVNode('div', { class: 'default-search-tree-wrapper' }, [
                    createVNode('div', { class: 'default-search-tree-input' }, [
                      createVNode(OioInputSearch, {
                        value: rootNode.value.searchValue,
                        placeholder: translateValueByKey('请输入关键字'),
                        'onUpdate:value': (val: string) => (rootNode.value.searchValue = val),
                        onSearch: ({ value }) => this.onSearch?.(value, rootNode)
                      })
                    ]),
                    treeComponent
                  ])
                ];
              }
              return [treeComponent];
            }
          }
        )
      );
    });
    let cascaderChildren = children;
    const contentSlot = this.$slots.content;
    if (contentSlot) {
      cascaderChildren = [
        ...children,
        withDirectives(createVNode('div', { class: 'default-card-cascader-content' }, contentSlot() || []), [
          [vShow, this.showContent]
        ])
      ];
    }
    return withDirectives(
      createVNode(
        OioSpin,
        {
          loading: this.loading,
          wrapperClassName: 'default-card-cascader-wrapper'
        },
        {
          default: () =>
            createVNode(
              OioCardCascader,
              {
                ...PropRecordHelper.collectionBasicProps(this.$attrs, ['default-card-cascader'])
              },
              {
                default: () => cascaderChildren
              }
            )
        }
      ),
      [[vShow, !this.invisible]]
    );
  }
});
</script>

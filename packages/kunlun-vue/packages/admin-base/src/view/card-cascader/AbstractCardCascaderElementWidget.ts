import { DEFAULT_SLOT_NAME } from '@oinone/kunlun-dsl';
import { ReturnPromise, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { OioTreeNode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { TreeService } from '../../service';
import { CardCascaderItemData, TreeNodeMetadata } from '../../typing';
import { TreeUtils } from '../../util';
import { AbstractTreeWidget } from '../tree';
import DefaultCardCascader from './DefaultCardCascader.vue';

const CONTENT_SLOT_NAME = 'content';

export abstract class AbstractCardCascaderElementWidget<
  V extends CardCascaderItemData = CardCascaderItemData
> extends AbstractTreeWidget<V> {
  @Widget.Reactive()
  protected rootNodes: OioTreeNode<V>[] | undefined;

  @Widget.Reactive()
  protected showContent = false;

  public initialize(props) {
    if (!props.slotNames) {
      props.slotNames = [DEFAULT_SLOT_NAME, CONTENT_SLOT_NAME, 'rowActions'];
    }
    super.initialize(props);
    this.setComponent(DefaultCardCascader);
    const { treeDefinition: rootMetadata } = this;
    if (rootMetadata) {
      this.rootNodes = [
        {
          title: rootMetadata.title,
          key: uniqueKeyGenerator(),
          value: {
            metadata: rootMetadata,
            pagination: { ...this.defaultPagination },
            selectedKeys: [] as string[],
            expandedKeys: [] as string[]
          } as V,
          children: [],
          isLeaf: false
        }
      ];
    }
    const { dslSlots, inline, view } = this;
    if (dslSlots) {
      TreeUtils.mergeLayoutBySlotName(dslSlots, CONTENT_SLOT_NAME, inline || false, view);
    }
    return this;
  }

  protected isLeafPredict(node: TreeNodeMetadata | undefined, useSelfReferences?: boolean) {
    if (!node) {
      return false;
    }
    if (useSelfReferences) {
      return false;
    }
    return !node.selfReferences;
  }

  @Widget.Method()
  protected async onSearch(keywords: string, rootNode?: OioTreeNode<V>) {
    if (!rootNode) {
      return;
    }
    const { metadata, parentNode } = rootNode.value;
    const isTree = !!metadata.selfReferences;
    if (keywords && isTree) {
      const results = await TreeService.queryKeywords4InnerSelfTree(keywords, rootNode);
      const { expandedKeys, nodes } = this.convertTreeByTreeSearchResponseBody(results);
      rootNode.children = nodes;
      rootNode.value.expandedKeys = expandedKeys;
      nodes.forEach((child) => {
        child.parent = rootNode;
      });
    } else if (keywords) {
      rootNode.value.searchValue = keywords;
      rootNode.value.pagination = { ...this.defaultPagination };
      rootNode.children = [];
      const results = await this.load(() => this.fetchData(rootNode, true));
      this.fillChildren(rootNode, results);
    } else if (parentNode) {
      await this.fetchNodeData(parentNode as OioTreeNode<V>, metadata);
      await this.onClearSearch();
    } else {
      const firstRootNode = this.rootNodes?.[0];
      if (firstRootNode) {
        await this.fetchNodeData(firstRootNode, metadata);
        await this.onClearSearch();
      }
    }
  }

  protected onClearSearch(): ReturnPromise<void> {}

  protected async fetchNodeData(node: OioTreeNode<V>, metadata: TreeNodeMetadata) {
    const { rootNodes } = this;
    if (!rootNodes) {
      return;
    }
    const { key, title } = metadata;
    const newRootNode: OioTreeNode<V> = {
      title,
      key: uniqueKeyGenerator(),
      value: {
        metadata,
        pagination: { ...this.defaultPagination },
        parentNode: node as OioTreeNode<CardCascaderItemData>
      } as V,
      children: [],
      isLeaf: false
    };
    this.loadIdempotentKey[node.key] = uniqueKeyGenerator();
    const oldKey = this.loadIdempotentKey[node.key];
    const results = await this.load(() => this.fetchData(newRootNode, true));
    if (oldKey === this.loadIdempotentKey[node.key]) {
      this.fillChildren(newRootNode, results);
      const index = rootNodes.findIndex((v) => v.value.metadata.key === key);
      if (index === -1) {
        rootNodes.push(newRootNode);
      } else {
        rootNodes.splice(index, rootNodes.length - index, newRootNode);
      }
    }
  }

  protected async mountedProcess() {
    await this.resetRootNode();
  }

  protected async refreshProcess() {
    await this.refreshNodes();
  }

  protected async resetRootNode(): Promise<void> {
    const { rootNodes } = this;
    if (rootNodes && rootNodes.length) {
      const firstRootNode = rootNodes?.[0];
      if (firstRootNode) {
        firstRootNode.value.pagination = { ...this.defaultPagination };
        firstRootNode.children = [];
        await this.loadData(firstRootNode);
        this.rootNodes = [firstRootNode];
      }
    }
  }

  protected async refreshNodes(): Promise<void> {
    const currentRootNodes = this.rootNodes;
    if (!currentRootNodes) {
      return;
    }
    await this.load(async () => {
      const nodeResults = await Promise.all(currentRootNodes.map((node) => this.refreshNodeFetchData(node)));
      const newRootNodes: OioTreeNode<V>[] = [];
      for (const nodeResult of nodeResults) {
        const { node, results } = nodeResult;
        const newRootNode: OioTreeNode<V> = {
          ...node,
          key: uniqueKeyGenerator(),
          children: []
        };
        this.fillChildren(newRootNode, results);
        newRootNodes.push(newRootNode);
      }
      this.rootNodes = newRootNodes;
    });
  }

  protected async refreshNodeFetchData(node: OioTreeNode<V>) {
    const pagination = node.value.pagination!;
    const { current, pageSize, total, totalPageSize } = pagination;
    pagination.current = 1;
    pagination.pageSize = current * pageSize;
    const results = await this.fetchData(node, true);
    pagination.current = current;
    pagination.pageSize = pageSize;
    return {
      node,
      isChange: {
        total: total !== pagination.total,
        totalPageSize: totalPageSize !== pagination.totalPageSize
      },
      results
    };
  }
}

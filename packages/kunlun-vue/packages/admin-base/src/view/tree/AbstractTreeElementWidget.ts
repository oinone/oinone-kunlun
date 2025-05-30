import { DEFAULT_SLOT_NAME } from '@kunlun/dsl';
import { ExpressionRunParam } from '@kunlun/expression';
import { BooleanHelper, ReturnPromise, uniqueKeyGenerator } from '@kunlun/shared';
import { OioTreeNode } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { TreeNodeResponseBody, TreeService } from '../../service';
import { TreeData, TreeNodeMetadata } from '../../typing';
import { TreeUtils } from '../../util';
import { AbstractTreeWidget } from './AbstractTreeWidget';
import DefaultTree from './DefaultTree.vue';

const CONTENT_SLOT_NAME = 'content';

/**
 * 标准树组件
 */
export abstract class AbstractTreeElementWidget<V extends TreeData = TreeData> extends AbstractTreeWidget<V> {
  @Widget.Reactive()
  protected rootNode: OioTreeNode<V> | undefined;

  @Widget.Reactive()
  protected searchRootNode: OioTreeNode<V> | undefined;

  @Widget.Reactive()
  protected searchValue: string | undefined;

  @Widget.Reactive()
  protected selectedKeys: string[] | undefined;

  @Widget.Reactive()
  protected expandedKeys: string[] | undefined;

  @Widget.Reactive()
  protected loadedKeys: string[] | undefined;

  @Widget.Reactive()
  protected get expandLevel(): string | undefined {
    return this.getDsl().expandLevel;
  }

  @Widget.Reactive()
  protected checkedKeys: string[] | undefined;

  @Widget.Reactive()
  protected showContent = false;

  @Widget.Reactive()
  protected get searchPlaceHolder() {
    return this.getDsl().searchPlaceholder;
  }

  @Widget.Reactive()
  public get checkable() {
    return BooleanHelper.toBoolean(this.getDsl().checkable);
  }

  @Widget.Reactive()
  public get autoExpandParent() {
    return BooleanHelper.toBoolean(this.getDsl().autoExpandParent);
  }

  @Widget.Reactive()
  public get showIcon() {
    return BooleanHelper.toBoolean(this.getDsl().showIcon);
  }

  @Widget.Reactive()
  public get checkAll() {
    return BooleanHelper.toBoolean(this.getDsl().checkboxAll);
  }

  @Widget.Reactive()
  public get checkAllLabel() {
    return this.getDsl().checkboxLabel;
  }

  @Widget.Reactive()
  public get searchRemote() {
    return this.getDsl().searchRemote ?? true;
  }

  public initialize(props) {
    if (!props.slotNames) {
      props.slotNames = [DEFAULT_SLOT_NAME, CONTENT_SLOT_NAME, 'rowActions'];
    }
    super.initialize(props);
    this.setComponent(DefaultTree);
    const { treeDefinition: rootMetadata, expandLevel } = this;
    if (rootMetadata) {
      this.rootNode = this.generatorRootNode(rootMetadata);
    }
    if (expandLevel) {
      this.getTreeMetadataList().map((v) => {
        if (v.model === expandLevel) {
          v.expandEndLevel = true;
        }
        return v;
      });
    }
    const { dslSlots, inline, view } = this;
    if (dslSlots) {
      TreeUtils.mergeLayoutBySlotName(dslSlots, CONTENT_SLOT_NAME, inline || false, view);
    }

    this.runtimeInitialed();

    if (!this.rootNode && rootMetadata) {
      this.rootNode = this.generatorRootNode(rootMetadata);
    }
    return this;
  }

  protected runtimeInitialed() {
    if (this.metadataRuntimeContext.view.extension) {
      const { checkedKeys, rootNode, searchRootNode, searchValue } = this.metadataRuntimeContext.view.extension;
      if (checkedKeys) {
        this.checkedKeys = this.metadataRuntimeContext.view.extension?.checkedKeys as string[];
      }
      if (rootNode) {
        this.rootNode = rootNode as OioTreeNode<V>;
      }
      if (searchValue) {
        this.searchValue = searchValue as string;
      }
      if (searchRootNode) {
        this.searchRootNode = searchRootNode as OioTreeNode<V>;
      }
    }
  }

  protected generatorRootNode(metadata: TreeNodeMetadata): OioTreeNode<V> {
    return {
      title: '',
      key: uniqueKeyGenerator(),
      value: {
        metadata,
        pagination: { ...this.defaultPagination }
      } as V,
      children: [],
      isLeaf: false
    };
  }

  @Widget.Method()
  public onUpdateSelectedKeys(val: string[]) {
    this.selectedKeys = val;
  }

  @Widget.Method()
  public onUpdateExpandedKeys(val: string[]) {
    this.expandedKeys = val;
  }

  @Widget.Method()
  public onUpdateLoadedKeys(val: string[]) {
    this.loadedKeys = val;
  }

  @Widget.Method()
  public onUpdateSearchValue(val: string) {
    this.searchValue = val;
  }

  @Widget.Method()
  protected async onSearch(keywords: string) {
    this.searchValue = keywords;
    const { rootNode, treeDefinition: rootMetadata } = this;
    if (!rootNode || !rootMetadata) {
      return;
    }
    if (!keywords) {
      this.searchRootNode = undefined;
      this.selectedKeys = [];
      if (this.searchRemote) {
        this.onClearSearch();
      }
      return;
    }
    if (!this.searchRemote) {
      const children = this.rootNode?.children?.filter((c) => c.title?.includes(keywords)) ?? [];
      this.searchRootNode = { ...this.rootNode, children } as OioTreeNode<V>;
      return;
    }
    const metadataList = this.getTreeMetadataList();
    if (metadataList.length) {
      await this.load(async () => {
        const results = await TreeService.queryKeywords4Tree(keywords, metadataList);
        const { expandedKeys, nodes } = this.convertTreeByTreeSearchResponseBody(results);
        const newRootNode = this.generatorRootNode(rootMetadata);
        nodes.forEach((child) => {
          child.setParent!(newRootNode);
        });
        this.searchRootNode = newRootNode;
        this.expandedKeys = expandedKeys;
      });
    }
  }

  @Widget.Method()
  public onCheckedAll(checkedAll: boolean): ReturnPromise<void> {
    if (checkedAll) {
      this.onNodeCheckedAll();
    } else {
      this.onNodeUncheckedAll();
    }
  }

  protected onNodeCheckedAll(): ReturnPromise<void> {}

  protected onNodeUncheckedAll(): ReturnPromise<void> {}

  protected async loadExpandLevel(node: OioTreeNode<V>, metadataList: TreeNodeMetadata[]) {
    const { nodes, expandedKeys } = await this.loadExpandLevelData(node, metadataList);
    this.expandedKeys = expandedKeys;
  }

  /**
   * 加载指定展开层级
   * @param node
   */
  public async loadExpandLevelData(
    node: OioTreeNode<V>,
    metadataList: TreeNodeMetadata[]
  ): Promise<{ nodes: OioTreeNode<V>[]; expandedKeys: string[] }> {
    this.loadIdempotentKey[node.key] = uniqueKeyGenerator();
    const idempotentKey = this.loadIdempotentKey[node.key];
    return this.load(async () => {
      const results = await this.fetchExpandEndLevel(metadataList, {
        expressionParameters: this.generatorExpressionParameters()
      });
      let { nodes, expandedKeys } = this.convertTreeByTreeSearchResponseBody(results);
      if (idempotentKey === this.loadIdempotentKey[node.key]) {
        const { nodes: processedNodes, expandedKeys: processedExpandedKeys } = this.loadExpandLevelDataAfterProcess(
          node,
          nodes,
          expandedKeys
        );
        nodes = processedNodes;
        expandedKeys = processedExpandedKeys;
      }
      return { nodes, expandedKeys };
    });
  }

  public loadExpandLevelDataAfterProcess(
    node: OioTreeNode<V>,
    nodes: OioTreeNode<V>[],
    expandedKeys: string[]
  ): { nodes: OioTreeNode<V>[]; expandedKeys: string[] } {
    this.fixExpandLevelNodes(nodes, expandedKeys);

    node.children = nodes;
    nodes.forEach((node) => {
      node.parent = node;
    });
    return { nodes, expandedKeys };
  }

  /**
   * 修复展开层级的 loaded、isLeaf、expandedKeys 数据
   * @param node
   */
  public fixExpandLevelNodes(nodes: OioTreeNode<V>[], expandedKeys: string[]) {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        node.loaded = true;
        node.isLeaf = false;
        this.fixExpandLevelNodes(node.children, expandedKeys);
      } else {
        node.loaded = false;
        node.isLeaf = this.isLeafPredict(node.value.metadata);
        const index = expandedKeys.indexOf(node.key);
        if (index !== -1) {
          expandedKeys.splice(index, 1);
        }
      }
    });
  }

  public async fetchExpandEndLevel(
    metadataList: TreeNodeMetadata[],
    options?: {
      expressionParameters?: ExpressionRunParam;
    }
  ): Promise<TreeNodeResponseBody[]> {
    const treeNodes = await TreeService.fetchExpandEndLevel(metadataList, options);
    return treeNodes;
  }

  protected generatorExpressionParameters(): ExpressionRunParam {
    return {
      activeRecords: this.activeRecords || [],
      rootRecord: this.rootData?.[0] || {},
      openerRecord: this.openerActiveRecords?.[0] || {},
      activeRecord: this.activeRecords?.[0] || {},
      scene: this.scene
    };
  }

  protected onClearSearch(): ReturnPromise<void> {}

  protected async mountedProcess() {
    const { rootNode, searchRemote, expandLevel } = this;
    if (!rootNode) {
      return;
    }
    if (!searchRemote) {
      await this.loadAllData();
      return;
    }
    if (expandLevel) {
      const metadataList = this.getTreeMetadataList();
      await this.loadExpandLevel(rootNode, metadataList);
      return;
    }
    await this.loadData(rootNode);
  }

  protected async refreshProcess() {
    const { rootNode, defaultPagination } = this;
    if (!rootNode) {
      return;
    }
    rootNode.children = [];
    if (!this.searchRemote) {
      await this.loadAllData();
      return;
    }
    if (this.expandLevel) {
      const metadataList = this.getTreeMetadataList();
      await this.loadExpandLevel(rootNode, metadataList);
      return;
    }
    rootNode.value.pagination = { ...defaultPagination };
    await this.loadData(rootNode);
    this.refreshProcessAfterProperties();
  }

  protected refreshProcessAfterProperties() {
    this.expandedKeys = [];
    this.loadedKeys = [];
  }

  /**
   * 加载全部节点
   */
  @Widget.Method()
  public async loadAllData() {
    const { rootNode, treeDefinition } = this;
    if (!rootNode || !treeDefinition) {
      throw new Error('Invalid root node');
    }
    if (rootNode.loaded) {
      return [];
    }
    this.loadIdempotentKey[rootNode.key] = uniqueKeyGenerator();
    const oldKey = this.loadIdempotentKey[rootNode.key];
    return this.load(async () => {
      const results = await this.fetchAll();
      if (oldKey === this.loadIdempotentKey[rootNode.key]) {
        const { nodes } = TreeService.convertTreeByResponseBody<V>(treeDefinition, results, {
          generatorKey: (item, value) => {
            const { data } = value;
            if (data) {
              return this.generatorKey(item.metadataKey, data);
            }
            return uniqueKeyGenerator();
          },
          computeNodeTitle: this.computeNodeTitle.bind(this)
        });
        nodes.forEach((child) => {
          child.setParent!(rootNode);
        });
        rootNode.loaded = true;
      }
      return results;
    });
  }

  public async fetchAll(): Promise<TreeNodeResponseBody[]> {
    const rootMetadata = this.treeDefinition;
    if (!rootMetadata) {
      return [];
    }
    const metadataList = this.getTreeMetadataList();
    if (!metadataList.length) {
      return [];
    }
    return TreeService.fetchAll(metadataList, { expressionParameters: this.generatorExpressionParameters() });
  }
}

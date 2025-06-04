import {
  ActiveRecord,
  ActiveRecords,
  Pagination,
  resolveDynamicDomain,
  RuntimeModel,
  RuntimeRelationField
} from '@oinone/kunlun-engine';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import {
  BooleanHelper,
  CallChaining,
  CastHelper,
  NumberHelper,
  ObjectUtils,
  Optional,
  ReturnPromise,
  TreeHelper,
  TreeNode,
  uniqueKeyGenerator
} from '@oinone/kunlun-shared';
import { EmptyStyle, SelectMode, WidgetTrigger } from '@oinone/kunlun-vue-ui-antd';
import { OioTreeNode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { debounce, DebouncedFunc, isNil, toInteger } from 'lodash-es';
import { BaseFieldProps, FormFieldWidget } from '../../basic';
import { TreeNodeResponseBody, TreeService } from '../../service';
import { TreeData, TreeNodeMetadata } from '../../typing';
import { FetchUtil, TreeUtils } from '../../util';

// fixme @zbh 20230214 此处使用节点模型对应的pks
const PKS = ['id'];

interface ResponseBody {
  label?: string;
  metadata: TreeNodeMetadata;
  value: ActiveRecord;
  isLeaf: boolean;
}

export interface BackfillDataParameters<V extends TreeData = TreeData> {
  selectedNodes: OioTreeNode<V>[];
  expandedKeys: string[];
  nodes: OioTreeNode<V>[];
}

export abstract class AbstractTreeFieldWidget<
  V extends TreeData = TreeData,
  Value = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends BaseFieldProps<Field> = BaseFieldProps<Field>
> extends FormFieldWidget<Value, Field, Props> {
  public static readonly METADATA_PK_SEPARATOR = ':';

  public static readonly PK_SEPARATOR = '-';

  protected defaultPagination = {
    current: 1,
    pageSize: 50
  } as Pagination;

  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected refreshCallChaining: CallChaining<boolean> | undefined;

  @Widget.Reactive()
  protected treeDefinition: TreeNodeMetadata | undefined;

  @Widget.Reactive()
  protected treeLevel = 0;

  @Widget.Reactive()
  protected rootNode: OioTreeNode<V> | undefined;

  @Widget.Reactive()
  protected searchRootNode: OioTreeNode<V> | undefined;

  @Widget.Reactive()
  protected checkedKeys: string[] | undefined;

  @Widget.Reactive()
  protected halfCheckedKeys: string[] | undefined;

  @Widget.Reactive()
  protected expandedKeys: string[] | undefined;

  @Widget.Reactive()
  protected get referencesModel(): RuntimeModel | undefined {
    return this.field.referencesModel;
  }

  @Widget.Reactive()
  protected get selectMode(): SelectMode {
    return SelectMode.single;
  }

  @Widget.Reactive()
  protected get selectable(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().selectable) || true;
  }

  @Widget.Reactive()
  protected get checkable(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().checkable) || false;
  }

  /**
   * 最多显示多少个 tag
   */
  @Widget.Reactive()
  public get maxTagCount() {
    const { maxTagCount } = this.getDsl();
    return NumberHelper.toNumber(maxTagCount) || undefined;
  }

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  public initialize(props) {
    super.initialize(props);
    this.treeDefinition = TreeUtils.convert(props.template);
    if (!this.treeDefinition) {
      this.treeDefinition = this.generatorDefaultTreeDefinition(props);
    }
    let treeLevel = 0;
    let currentTreeDefinition = this.treeDefinition;
    while (currentTreeDefinition) {
      treeLevel++;
      currentTreeDefinition = currentTreeDefinition.child;
    }
    this.treeLevel = treeLevel;
    const { treeDefinition: rootMetadata } = this;
    if (rootMetadata) {
      this.rootNode = this.generatorRootNode(rootMetadata);
    }
    return this;
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
      level: 1,
      isLeaf: false
    };
  }

  protected getTreeMetadataList(): TreeNodeMetadata[] {
    const metadataList: TreeNodeMetadata[] = [];
    let target = this.treeDefinition;
    while (target) {
      metadataList.push(target);
      target = target.child;
    }
    return metadataList;
  }

  protected generatorDefaultTreeDefinition(props: Props): TreeNodeMetadata | undefined {
    return undefined;
  }

  @Widget.Reactive()
  public get invisible() {
    if (!this.treeDefinition) {
      return true;
    }
    return super.invisible;
  }

  protected loadIdempotentKey: string | undefined;

  /**
   * 加载指定节点的子节点（展开时懒加载）
   * @param node
   */
  @Widget.Method()
  public async loadData(node: OioTreeNode<V>) {
    if (this.isFetchAll) {
      return this.loadAllData();
    }
    return this.$loadData(node);
  }

  protected async $loadData(node: OioTreeNode<V>) {
    this.loadIdempotentKey = uniqueKeyGenerator();
    const oldKey = this.loadIdempotentKey;
    return this.loadNode(node, async () => {
      const results = await this.fetchData(node);
      if (oldKey === this.loadIdempotentKey) {
        this.fillChildren(node, results);
        node.loaded = true;
      }
      return results;
    });
  }

  /**
   * 加载指定节点的更多子节点
   * @param node
   */
  @Widget.Method()
  public async loadMoreData(node: OioTreeNode<V>) {
    const { parent } = node;
    if (!parent) {
      return [];
    }
    parent.value.pagination!.current++;
    this.loadIdempotentKey = uniqueKeyGenerator();
    const oldKey = this.loadIdempotentKey;
    return this.loadNode(parent, async () => {
      const results = await this.fetchData(parent);
      if (oldKey === this.loadIdempotentKey) {
        this.fillChildren(parent, results);
      }
      return results;
    });
  }

  /**
   * 加载全部节点
   */
  @Widget.Method()
  public async loadAllData() {
    this.enableLoadData = false;
    const { rootNode, treeDefinition } = this;
    if (!rootNode || !treeDefinition) {
      throw new Error('Invalid root node');
    }
    if (rootNode.loaded) {
      return [];
    }
    this.loadIdempotentKey = uniqueKeyGenerator();
    const oldKey = this.loadIdempotentKey;
    return this.load(async () => {
      const results = await this.fetchAll();
      if (oldKey === this.loadIdempotentKey) {
        const { nodes } = TreeService.convertTreeByResponseBody<V>(treeDefinition, results, {
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

  @Widget.Method()
  public onUpdateExpandedKeys(val: string[]) {
    this.expandedKeys = val;
  }

  @Widget.Method()
  public onUpdateCheckedKeys(val: string[]) {
    this.checkedKeys = val;
  }

  @Widget.Method()
  public onUpdateHalfCheckedKeys(val: string[]) {
    this.halfCheckedKeys = val;
  }

  @Widget.Reactive()
  protected get enableSearch(): boolean {
    return BooleanHelper.toBoolean(this.getDsl().enableSearch) || true;
  }

  @Widget.Reactive()
  protected enableLoadData = true;

  @Widget.Method()
  protected onSearch(keywords: string) {
    if (!this.debounceInternalOnSearch) {
      this.debounceInternalOnSearch = debounce(this.internalOnSearch, 500);
    }
    this.debounceInternalOnSearch(keywords);
  }

  protected debounceInternalOnSearch: DebouncedFunc<(keywords: string) => void> | undefined;

  protected async internalOnSearch(keywords: string) {
    const { rootNode, treeDefinition: rootMetadata } = this;
    if (!rootNode || !rootMetadata) {
      return;
    }
    if (!keywords) {
      this.onUpdateExpandedKeys([]);
      this.searchRootNode = undefined;
      return;
    }
    const metadataList = this.getTreeMetadataList();
    if (!metadataList.length) {
      return;
    }
    await this.load(async () => {
      const results = await TreeService.queryKeywords4Tree(keywords, metadataList, {
        expressionParameters: this.generatorExpressionParameters()
      });
      const { expandedKeys, nodes } = this.convertTreeByTreeSearchResponseBody(results);
      const newRootNode = this.generatorRootNode(rootMetadata);
      nodes.forEach((child) => {
        child.setParent!(newRootNode);
      });
      this.searchRootNode = newRootNode;
      this.onUpdateExpandedKeys(expandedKeys);
    });
  }

  public async fetchData(node: OioTreeNode<V>, disableSelfReferences?: boolean): Promise<ResponseBody[]> {
    let selfFilter: string | undefined;
    let filter: string | undefined;
    if (node.preloaded) {
      const backfillDataIndex = (node.level || 1) - 1;
      const currentMetadata = node.value.metadata;
      const { isRoot, nextMetadata } = TreeService.getNextMetadata(node);
      if (nextMetadata) {
        if (isRoot) {
          filter = this.getBackfillDataFilter(nextMetadata, backfillDataIndex);
        } else {
          selfFilter = this.getBackfillDataFilter(currentMetadata, backfillDataIndex);
          filter = this.getBackfillDataFilter(nextMetadata, backfillDataIndex);
        }
      } else {
        selfFilter = this.getBackfillDataFilter(currentMetadata, backfillDataIndex);
      }
    }
    const result = await TreeService.fetchChildren(node, {
      disableSelfReferences,
      selfFilter,
      filter,
      expressionParameters: this.generatorExpressionParameters()
    });
    node.value.pagination!.total = toInteger(result.totalElements);
    node.value.pagination!.totalPageSize = toInteger(result.totalPages);
    const results: ResponseBody[] = [];
    const rootMetadata = node.value.metadata;
    result.content?.forEach((v) => {
      const metadata = TreeUtils.findMetadataByKey(rootMetadata, v.metadataKey);
      if (metadata) {
        results.push({
          metadata,
          value: JSON.parse(v.value),
          isLeaf: v.isLeaf
        });
      }
    });
    return results;
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

  protected getBackfillDataFilter(metadata: TreeNodeMetadata, index: number): string | undefined {
    const pk = (this.referencesModel?.pks || PKS)[0];
    // fixme @zbh 20230209 此处需要处理rsql元组
    if (pk) {
      const metadataKey = metadata.key;
      const pkValues = (this.backfillTreeNodes[index]?.filter((v) => v.value.metadata.key === metadataKey) || [])
        .map((v) => v.value.data?.[pk])
        .filter((v) => !!v);
      if (pkValues?.length) {
        return `${pk} =out= ("${pkValues.join('", "')}")`;
      }
    }
  }

  public fillChildren(node: OioTreeNode<V>, results: ResponseBody[]) {
    const length = results.length;
    if (!length) {
      node.isLeaf = !node.children.length;
      return;
    }
    let children = node.children;
    if (!children) {
      children = [];
      node.children = children;
    }
    const pks = this.referencesModel?.pks || [];
    const isGeneratorKey = !pks.length;
    results.forEach((v) => {
      const { label, metadata, value } = v;
      let key: string | undefined;
      if (isGeneratorKey) {
        key = value.__draftId;
        if (!key) {
          key = uniqueKeyGenerator();
          value.__draftId = key;
        }
      } else {
        key = `${metadata.key}${AbstractTreeFieldWidget.METADATA_PK_SEPARATOR}${pks
          .map((pk) => `${value[pk]}`)
          .join(AbstractTreeFieldWidget.PK_SEPARATOR)}`;
      }
      const newNode = this.generatorNewTreeNode(node, key, label, metadata, value);
      Optional.ofNullable(v.isLeaf).ifPresent((isLeaf) => {
        newNode.isLeaf = isLeaf;
      });
      children.push(newNode);
    });
  }

  protected generatorNewTreeNode(
    parent: OioTreeNode<V>,
    key: string,
    title: string | undefined,
    metadata: TreeNodeMetadata,
    data: ActiveRecord
  ): OioTreeNode<V> {
    const value = {
      label: title,
      metadata,
      data,
      pagination: { ...this.defaultPagination }
    } as V;
    let parentLevel = parent.level;
    if (!parentLevel) {
      parentLevel = 0;
    }
    return {
      key,
      title: this.computeNodeTitle(value),
      value,
      parent,
      level: parentLevel + 1,
      children: [],
      isLeaf: this.isLeafPredict(metadata)
    };
  }

  protected isLeafPredict(node: TreeNodeMetadata | undefined) {
    if (!node) {
      return false;
    }
    const { child, selfReferences } = node;
    let isLeaf = !child || !child.references;
    if (!isLeaf) {
      return false;
    }
    if (isLeaf) {
      isLeaf = !selfReferences;
    }
    return isLeaf;
  }

  protected computeNodeTitle(val: V): string {
    const { label, metadata, data } = val;
    if (!isNil(label)) {
      return label;
    }
    let title = metadata.label;
    if (title && data) {
      title = this.executeNodeExpression(data, title, EmptyStyle.hyphen);
      if (isNil(title)) {
        title = EmptyStyle.hyphen;
      }
    } else {
      title = EmptyStyle.hyphen;
    }
    return title;
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

  protected $onSelectedChange(selectedNodes: OioTreeNode<TreeData>[] | null | undefined) {
    if (selectedNodes === undefined) {
      return;
    }
    if (selectedNodes === null) {
      this.change(null);
      return;
    }
    const data: ActiveRecord[] = selectedNodes.map((v) => v.value.data!).filter((v) => !!v) || [];
    if (this.selectMode === SelectMode.multiple) {
      this.change(CastHelper.cast<Value>(data));
    } else {
      this.change(CastHelper.cast<Value>(data[0]));
    }
  }

  /**
   * 加载状态调用函数
   * @param node
   * @param fn
   * @param args
   * @protected
   */
  public async loadNode<R>(node: OioTreeNode<V>, fn: (...args) => R, ...args): Promise<R> {
    if (node.parent) {
      node.loading = true;
      try {
        return await fn(...args);
      } finally {
        node.loading = false;
      }
    }
    return super.load(fn, ...args);
  }

  public executeNodeExpression<T>(
    activeRecord: ActiveRecord,
    expression: string,
    errorValue?: T
  ): T | string | undefined {
    return Expression.run(
      {
        activeRecords: [activeRecord],
        rootRecord: this.rootData?.[0] || {},
        openerRecord: this.openerActiveRecords?.[0] || {},
        scene: this.scene
      } as ExpressionRunParam,
      expression,
      errorValue
    );
  }

  protected async mountedProcess(): Promise<void> {
    await this.reloadBackfillDataByValue();
  }

  protected async refreshProcess(): Promise<void> {
    await this.reloadBackfillDataByValue();
  }

  protected subscribeProcess() {
    this.reloadFormData$.subscribe(() => {
      this.reloadBackfillDataByValue();
    });
  }

  protected async reloadBackfillDataByValue(): Promise<void> {
    if (!this.rootNode) {
      return;
    }
    return this.load<void>(async () => {
      if (!(await this.backfillDataByValue())) {
        this.clearBackfillDataProcess();
      }
    });
  }

  /**
   * 通过值进行回填数据
   * @protected
   */
  protected async backfillDataByValue(): Promise<boolean> {
    this.backfillTreeNodes = [];
    const values = this.value as ActiveRecords | null | undefined;
    if (!values) {
      return false;
    }
    let currentValues: ActiveRecord[];
    if (Array.isArray(values)) {
      currentValues = values;
    } else {
      currentValues = [values];
    }
    if (!currentValues.length) {
      return false;
    }
    const metadataList = this.getTreeMetadataList();
    if (!metadataList.length) {
      return false;
    }
    if (!this.backfillDataPredict(currentValues, metadataList)) {
      return false;
    }
    let data: BackfillDataParameters<V> | undefined;
    if (!this.enableLoadData && this.rootNode?.loaded) {
      data = this.getBackfillData(currentValues, metadataList);
    } else {
      const backfillList = await this.fetchBackfillData(currentValues, metadataList);
      if (!backfillList) {
        return false;
      }
      data = this.convertBackfillData(currentValues, metadataList, backfillList);
    }
    if (!data) {
      return false;
    }
    this.backfillDataProcess(data);
    return true;
  }

  /**
   * 获取回填数据
   * @protected
   */
  protected async fetchBackfillData(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[]
  ): Promise<TreeNodeResponseBody[] | undefined> {
    if (this.isFetchAll) {
      this.enableLoadData = false;
      return TreeService.fetchAll(metadataList, { expressionParameters: this.generatorExpressionParameters() });
    }
    return TreeService.reverselyQuery(currentValues, metadataList, {
      expressionParameters: this.generatorExpressionParameters()
    });
  }

  /**
   * 回填数据判定
   * @protected
   */
  protected backfillDataPredict(currentValues: ActiveRecord[], metadataList: TreeNodeMetadata[]): boolean {
    return true;
  }

  /**
   * 回填数据处理
   * @param data
   * @protected
   */
  protected abstract backfillDataProcess(data: BackfillDataParameters<V>): ReturnPromise<void>;

  /**
   * 清理回填数据
   * @protected
   */
  protected abstract clearBackfillDataProcess(): ReturnPromise<void>;

  @Widget.Reactive()
  protected get isFetchAll(): boolean {
    const isFetchAll = BooleanHelper.toBoolean(this.getDsl().fetchAll);
    if (isFetchAll == null) {
      return this.selectMode === SelectMode.multiple;
    }
    return isFetchAll;
  }

  /**
   * 回填树节点存储
   * @protected
   */
  protected backfillTreeNodes: OioTreeNode<V>[][] = [];

  /**
   * 转换回填数据
   * @param currentValues 当前选中数据
   * @param metadataList 节点元数据列表
   * @param list 回填数据
   * @param customCreateNodeCallback 自定义创建节点回调
   * @param customUpdateNodeCallback 自定义更新节点回调
   * @protected
   */
  protected convertBackfillData(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[],
    list: TreeNodeResponseBody[],
    customCreateNodeCallback?: (node: OioTreeNode<V>, value: V | undefined) => void,
    customUpdateNodeCallback?: (node: OioTreeNode<V>, value: V) => void
  ): BackfillDataParameters<V> | undefined {
    const { treeDefinition, defaultPagination, isFetchAll } = this;
    const compareRecords = this.generatorCompareRecords(currentValues, metadataList);
    if (!compareRecords) {
      return undefined;
    }
    const selectedNodes: OioTreeNode<V>[] = [];
    const expandedKeys: string[] = [];
    const nodes = CastHelper.cast<OioTreeNode<V>[]>(
      TreeHelper.convert<TreeNodeResponseBody, V, OioTreeNode<V>>(
        list,
        (v) => {
          const key = v.key || uniqueKeyGenerator();
          expandedKeys.push(key);
          return key;
        },
        (v) => {
          const { parentKeys } = v;
          if (parentKeys?.length === 1 && parentKeys[0] === v.key) {
            return undefined;
          }
          return parentKeys;
        },
        (v) => {
          const { label, metadataKey, value, isLeaf } = v;
          if (metadataKey) {
            let metadata = treeDefinition;
            while (metadata) {
              if (metadata.key === metadataKey) {
                return {
                  label,
                  metadata,
                  isLeaf,
                  data: JSON.parse(value),
                  pagination: isFetchAll ? undefined : { ...defaultPagination }
                } as V;
              }
              metadata = metadata.child;
            }
          }
          return undefined;
        },
        (key, value, parent) => {
          const node = CastHelper.cast<OioTreeNode<V>>(TreeNode.newInstance(key, value, CastHelper.cast(parent)));
          if (value) {
            node.title = this.computeNodeTitle(value);
            node.isLeaf = Optional.ofNullable(value.isLeaf).orElseGet(() => this.isLeafPredict(value.metadata))!;
            this.pushSelectedNodes(currentValues, selectedNodes, compareRecords, node, value.data);
          }
          if (isFetchAll) {
            node.loaded = true;
          } else {
            node.preloaded = true;
          }
          customCreateNodeCallback?.(node, value);
          return node;
        },
        (node, value) => {
          node.title = this.computeNodeTitle(value);
          node.isLeaf = Optional.ofNullable(value.isLeaf).orElseGet(() => this.isLeafPredict(value.metadata))!;
          this.pushSelectedNodes(currentValues, selectedNodes, compareRecords, node, value.data);
          customUpdateNodeCallback?.(node, value);
          return node;
        }
      )
    );
    const { treeDefinition: rootMetadata } = this;
    if (!rootMetadata) {
      throw new Error('Invalid root metadata.');
    }
    const rootNode = this.generatorRootNode(rootMetadata);
    for (const node of nodes) {
      node.setParent!(rootNode);
    }
    this.collectionBackfillTreeNodes(nodes);
    if (isFetchAll) {
      rootNode.loaded = true;
    } else {
      rootNode.preloaded = true;
    }
    this.rootNode = rootNode;
    return {
      selectedNodes,
      expandedKeys,
      nodes
    };
  }

  protected getBackfillData(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[]
  ): BackfillDataParameters<V> | undefined {
    const selectedNodes: OioTreeNode<V>[] = [];
    const expandedKeys: string[] = [];
    const compareRecords = this.generatorCompareRecords(currentValues, metadataList);
    if (!compareRecords) {
      return undefined;
    }
    this.recursionPushSelectNodes(this.rootNode!, currentValues, selectedNodes, compareRecords);
    return {
      selectedNodes,
      expandedKeys,
      nodes: []
    };
  }

  protected recursionPushSelectNodes(
    node: OioTreeNode<TreeData>,
    currentValues: ActiveRecord[],
    selectedNodes: OioTreeNode<TreeData>[],
    compareRecords: ActiveRecord[]
  ) {
    for (const nextNode of node.children) {
      this.pushSelectedNodes(currentValues, selectedNodes, compareRecords, nextNode, nextNode.value.data);
      if (nextNode.children.length) {
        this.recursionPushSelectNodes(nextNode, currentValues, selectedNodes, compareRecords);
      }
    }
  }

  /**
   * 生成选中比较记录
   * @param currentValues 当前选中数据
   * @param metadataList 节点元数据列表
   * @protected
   */
  protected generatorCompareRecords(
    currentValues: ActiveRecord[],
    metadataList: TreeNodeMetadata[]
  ): ActiveRecord[] | undefined {
    const compareRecords = currentValues
      .map((v) => FetchUtil.generatorPksObject(this.referencesModel!, v)!)
      .filter((v) => !!v);
    if (currentValues.length !== compareRecords.length) {
      console.error('Invalid values.', currentValues);
      return undefined;
    }
    return compareRecords;
  }

  protected pushSelectedNodes(
    currentValues: ActiveRecord[],
    selectedNodes: OioTreeNode<TreeData>[],
    compareRecords: ActiveRecord[],
    node: OioTreeNode<TreeData>,
    record: ActiveRecord | undefined
  ) {
    if (record && this.isSelectedNode(compareRecords, record)) {
      selectedNodes.push(node);
    }
  }

  protected convertTreeByTreeSearchResponseBody(list: TreeNodeResponseBody[]) {
    const { treeDefinition, defaultPagination } = this;
    if (!treeDefinition) {
      throw new Error('Invalid tree definition');
    }
    return TreeService.convertTreeByResponseBody<V>(treeDefinition, list, {
      defaultPagination,
      computeNodeTitle: this.computeNodeTitle.bind(this)
    });
  }

  protected static readonly SELECTED_PREDICT_IGNORED_PREFIX = '__';

  protected isSelectedNode(compareRecords: ActiveRecord[], record: ActiveRecord): boolean {
    for (const compareRecord of compareRecords) {
      let isSelectedNode = true;
      for (const [key, value] of Object.entries(compareRecord)) {
        if (!key.startsWith(AbstractTreeFieldWidget.SELECTED_PREDICT_IGNORED_PREFIX) && record[key] !== value) {
          isSelectedNode = false;
          break;
        }
      }
      if (isSelectedNode) {
        return true;
      }
    }
    return false;
  }

  protected collectionBackfillTreeNodes(nodes: OioTreeNode<V>[]) {
    const repeatKeySet = new Set<string>();
    const currentNodes: OioTreeNode<V>[] = [];
    const nextNodes: OioTreeNode<V>[] = [];
    for (const node of nodes) {
      if (!ObjectUtils.isRepeat(repeatKeySet, node.key)) {
        currentNodes.push(node);
      }
      nextNodes.push(...node.children);
    }
    this.backfillTreeNodes.push(currentNodes);
    if (nextNodes.length) {
      this.collectionBackfillTreeNodes(nextNodes);
    }
  }

  @Widget.Reactive()
  protected get watchedFilter() {
    const definitioinStack = [this.treeDefinition];
    let finalString = '';
    while (definitioinStack.length > 0) {
      const current = definitioinStack.shift();
      if (current?.filter) {
        finalString += this.resolveDynamicDomain(current.filter);
      }
      if (current?.child) {
        definitioinStack.push(current.child);
      }
    }
    return finalString;
  }

  protected resolveDynamicDomain(filter: string): string {
    return resolveDynamicDomain(filter, this.formData, this.rootData?.[0] || {}, this.openerActiveRecords?.[0] || {});
  }

  @Widget.Watch('watchedFilter')
  protected filterChanged() {
    this.clearBackfillDataProcess();
  }

  protected $$mounted() {
    super.$$mounted();
    if (this.mountedCallChaining) {
      this.mountedCallChaining.hook(this.path, async () => {
        await this.mountedProcess();
        this.subscribeProcess();
      });
    } else {
      Promise.all([this.mountedProcess()]).then(() => {
        this.subscribeProcess();
      });
    }
    this.refreshCallChaining?.hook(this.path, async () => {
      await this.refreshProcess();
    });
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.mountedCallChaining?.unhook(this.path);
    this.refreshCallChaining?.unhook(this.path);
  }
}

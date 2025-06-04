import {
  ActiveRecord,
  getRefreshParameters,
  getStaticRelationField,
  isRelationField,
  isStaticRelationField,
  ModelCache,
  Pagination,
  RefreshCallChainingScope
} from '@oinone/kunlun-engine';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { Condition } from '@oinone/kunlun-request';
import { DEFAULT_FALSE_CONDITION, DEFAULT_TRUE_CONDITION } from '@oinone/kunlun-service';
import { BooleanHelper, CallChaining, Optional, ReturnPromise, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { OioTreeNode } from '@oinone/kunlun-vue-ui-antd';
import { isAllInvisible, Widget } from '@oinone/kunlun-vue-widget';
import { isNil, toInteger } from 'lodash-es';
import { BaseElementWidget } from '../../basic';
import { FETCH_DATA_WIDGET_PRIORITY } from '../../basic/constant';
import { TreeNodeResponseBody, TreeService } from '../../service';
import { CardCascaderItemData, TreeData, TreeNodeMetadata, TreeRefreshCallChainingParameters } from '../../typing';
import { FetchUtil, TreeUtils } from '../../util';

type ResponseBody = {
  label?: string;
  metadata: TreeNodeMetadata;
  value: ActiveRecord;
  isLeaf: boolean;
};

/**
 * <h3>抽象树基类</h3>
 * <p>
 *  该组件作为Tree数据结构的基本抽象，仅用于定义数据获取，数据回填，数据结构处理等功能，与具体展示组件无关
 * </p>
 */
export abstract class AbstractTreeWidget<V extends TreeData = TreeData> extends BaseElementWidget {
  protected defaultPagination = {
    current: 1,
    pageSize: 50
  } as Pagination;

  @Widget.Reactive()
  protected treeDefinition: TreeNodeMetadata | undefined;

  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Inject('refreshCallChaining')
  protected parentRefreshCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  protected currentRefreshCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get refreshCallChaining(): CallChaining | undefined {
    return this.currentRefreshCallChaining;
  }

  public initialize(props) {
    super.initialize(props);
    this.treeDefinition = TreeUtils.convert(props.template);
    return this;
  }

  @Widget.Reactive()
  public get allInvisible() {
    return false;
  }

  @Widget.Reactive()
  public get invisible() {
    if (!this.treeDefinition) {
      return true;
    }
    return super.invisible;
  }

  protected childrenInvisibleProcess(): boolean {
    const children = this.getChildren();
    if (children.length) {
      return isAllInvisible(children);
    }
    return false;
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

  protected loadIdempotentKey: Record<string, string> = {};

  /**
   * 加载指定节点的子节点（展开时懒加载）
   * @param node
   */
  @Widget.Method()
  public async loadData(node: OioTreeNode<V>) {
    this.loadIdempotentKey[node.key] = uniqueKeyGenerator();
    const idempotentKey = this.loadIdempotentKey[node.key];
    return this.loadNode(node, async () => {
      const results = await this.fetchData(node);
      if (idempotentKey === this.loadIdempotentKey[node.key]) {
        this.fillChildren(node, results);
        delete this.loadIdempotentKey[node.key];
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
    this.loadIdempotentKey[node.key] = uniqueKeyGenerator();
    const idempotentKey = this.loadIdempotentKey[node.key];
    return this.loadNode(parent, async () => {
      const results = await this.fetchData(parent);
      if (idempotentKey === this.loadIdempotentKey[node.key]) {
        this.fillChildren(parent, results);
        delete this.loadIdempotentKey[node.key];
      }
      return results;
    });
  }

  @Widget.Method()
  public onSelected(node: OioTreeNode<V>, selected: boolean): ReturnPromise<void> {
    if (selected) {
      this.onNodeSelected(node);
    } else {
      this.onNodeUnselected(node);
    }
  }

  protected onNodeSelected(node: OioTreeNode<V>): ReturnPromise<void> {}

  protected onNodeUnselected(node: OioTreeNode<V>): ReturnPromise<void> {}

  @Widget.Method()
  public onChecked(node: OioTreeNode<V>, checked: boolean): ReturnPromise<void> {
    if (checked) {
      this.onNodeChecked(node);
    } else {
      this.onNodeUnchecked(node);
    }
  }

  protected onNodeChecked(node: OioTreeNode<V>): ReturnPromise<void> {}

  protected onNodeUnchecked(node: OioTreeNode<V>): ReturnPromise<void> {}

  @Widget.Reactive()
  protected get enableSearch() {
    return BooleanHelper.toBoolean(this.getDsl().enableSearch);
  }

  /**
   * @deprecated
   */
  @Widget.Reactive()
  public get isSkipRefreshSelf() {
    return this.getDsl().refresh === 'once';
  }

  public async fetchData(node: OioTreeNode<V>, disableSelfReferences?: boolean): Promise<ResponseBody[]> {
    const result = await TreeService.fetchChildren(node, {
      disableSelfReferences
    });
    const pagination = node.value.pagination!;
    pagination.total = toInteger(result.totalElements);
    pagination.totalPageSize = toInteger(result.totalPages);
    const results: ResponseBody[] = [];
    const rootMetadata = node.value.metadata;
    result.content?.forEach((v) => {
      const metadata = TreeUtils.findMetadataByKey(rootMetadata, v.metadataKey);
      if (metadata) {
        results.push({
          metadata,
          value: JSON.parse(v.value),
          isLeaf: v.isLeaf,
          label: v.label
        });
      }
    });
    return results;
  }

  public fillChildren(node: OioTreeNode<V>, results: ResponseBody[]) {
    const length = results.length;
    if (!length) {
      node.isLeaf = true;
      return;
    }
    results.forEach((v) => {
      const { label, metadata, value } = v;
      const key = this.generatorKey(metadata.key, value);
      const newNode = this.generatorNewTreeNode(node, key, label, metadata, value);
      Optional.ofNullable(v.isLeaf).ifPresent((isLeaf) => {
        newNode.isLeaf = isLeaf;
      });
      node.children.push(newNode);
    });
  }

  public generatorKey(metadataKey: string, data: ActiveRecord) {
    const pks = this.model.pks || [];
    if (pks.length) {
      return `${metadataKey}:${pks.map((pk) => data[pk]).join('#')}`;
    }
    let { __draftId } = data;
    if (!__draftId) {
      __draftId = uniqueKeyGenerator();
      data.__draftId = __draftId;
    }
    return __draftId;
  }

  protected generatorNewTreeNode(
    parent: OioTreeNode<V>,
    key: string,
    title: string | undefined,
    metadata: TreeNodeMetadata | undefined,
    data: ActiveRecord
  ): OioTreeNode<V> {
    const value = {
      label: title,
      metadata,
      data,
      pagination: { ...this.defaultPagination }
    } as V;
    return {
      key,
      title: this.computeNodeTitle(value),
      value,
      parent,
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

  protected convertTreeByTreeSearchResponseBody(list: TreeNodeResponseBody[]) {
    const { treeDefinition, defaultPagination } = this;
    if (!treeDefinition) {
      throw new Error('Invalid tree definition');
    }
    return TreeService.convertTreeByResponseBody<V>(treeDefinition, list, {
      defaultPagination,
      generatorKey: (item, value) => {
        const { data } = value;
        if (data) {
          return this.generatorKey(item.metadataKey, data);
        }
        return uniqueKeyGenerator();
      },
      computeNodeTitle: this.computeNodeTitle.bind(this)
    });
  }

  protected computeNodeTitle(val: V): string {
    const { label, metadata, data } = val;
    if (!isNil(label)) {
      return label;
    }
    let title = metadata.label;
    if (title && data) {
      title = this.executeExpression(data, title, '-');
      if (isNil(title)) {
        title = '-';
      }
    } else {
      title = '-';
    }
    return title;
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
      const result = fn(...args);
      return result;
    }
    return super.load(fn, ...args);
  }

  public executeExpression<T>(activeRecord: ActiveRecord, expression: string, errorValue?: T): T | string | undefined {
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

  protected abstract mountedProcess(): ReturnPromise<void>;

  protected abstract refreshProcess(): ReturnPromise<void>;

  protected $$beforeMount() {
    super.$$beforeMount();
    this.currentRefreshCallChaining = new CallChaining();
  }

  protected $$mounted() {
    super.$$mounted();
    this.mountedCallChaining?.hook(
      this.path,
      async () => {
        await this.mountedProcess();
      },
      FETCH_DATA_WIDGET_PRIORITY
    );
    let isRefreshParent = false;
    this.currentRefreshCallChaining?.callBefore(
      (...args) => {
        const { refreshParent } = getRefreshParameters(args);
        if (refreshParent) {
          isRefreshParent = true;
          this.parentRefreshCallChaining?.syncCall(...(args || []));
          return false;
        }
        return true;
      },
      { immutable: true }
    );
    this.currentRefreshCallChaining?.hook(
      this.path,
      async (args, callBeforeResult) => {
        if (callBeforeResult === false) {
          return;
        }
        const refreshParameters = getRefreshParameters(args) as TreeRefreshCallChainingParameters;
        if (!refreshParameters.isSkipRefreshSelf && !this.isSkipRefreshSelf) {
          await this.refreshProcess();
        }
      },
      FETCH_DATA_WIDGET_PRIORITY
    );
    this.parentRefreshCallChaining?.hook(
      this.path,
      async (args, callBeforeResult) => {
        if (callBeforeResult === false) {
          return;
        }
        const refreshParameters = getRefreshParameters(args) as TreeRefreshCallChainingParameters;
        if (!refreshParameters.isSkipRefreshSelf && !this.isSkipRefreshSelf) {
          if (refreshParameters.scope !== RefreshCallChainingScope.search) {
            await this.refreshProcess();
          }
        }
        if (isRefreshParent) {
          refreshParameters.refreshParent = false;
          isRefreshParent = false;
          this.currentRefreshCallChaining?.syncCall(refreshParameters, ...((args || []).slice(1) || []));
        }
      },
      FETCH_DATA_WIDGET_PRIORITY
    );
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.mountedCallChaining?.unhook(this.path);
    this.parentRefreshCallChaining?.unhook(this.path);
  }

  /**
   * 选中节点（搜索）
   * @param node 选中节点
   */
  protected async onSelectedForSearch(node: OioTreeNode<V>): Promise<boolean> {
    const { metadata, data } = node.value;
    if (!metadata || !data) {
      return false;
    }
    const { model, search } = metadata;
    if (!search) {
      return false;
    }
    const modelField = await TreeUtils.getModelFieldMetadata(search, model);
    if (modelField && isRelationField(modelField)) {
      const condition = new Condition(DEFAULT_TRUE_CONDITION);
      let targetCondition: Condition | undefined;
      const activeTreeContext = {};
      const res = await TreeUtils.consumerReferenceModelField(
        model,
        modelField,
        (originFields, targetFields, index, reverse) => {
          const originField = originFields[index];
          const targetField = targetFields[index];
          let key: string;
          let value: unknown;
          if (isStaticRelationField(originField)) {
            value = getStaticRelationField(originField);
            key = targetField;
          } else if (isStaticRelationField(targetField)) {
            if (reverse) {
              return;
            }
            value = getStaticRelationField(targetField);
            key = originField;
          } else {
            key = targetField;
            value = data[originField];
          }
          const splitKeys = key.split('.');

          if (splitKeys.length === 1) {
            activeTreeContext[key] = value;
          } else {
            splitKeys.reduce((context, key, index) => {
              if (index === splitKeys.length - 1) {
                context[key] = value;
              } else if (!context[key]) {
                context[key] = {};
              }
              return context[key];
            }, activeTreeContext);
          }

          if (targetCondition) {
            targetCondition.and(TreeUtils.newCondition(key, value));
          } else {
            targetCondition = TreeUtils.newCondition(key, value);
          }
        }
      );
      if (res) {
        if (targetCondition) {
          condition.and(targetCondition);
        }
        this.setRuntimeFilter(condition);

        this.rootRuntimeContext.view.context = {
          ...(this.rootRuntimeContext.view.context || {}),
          activeTreeContext,
          rootConditionBodyData: activeTreeContext
        };

        const refreshParameters: TreeRefreshCallChainingParameters = {
          isSkipRefreshSelf: true,
          refreshParent: false,
          currentPage: 1
        };
        this.parentRefreshCallChaining?.syncCall(refreshParameters);
        return true;
      }
      /**
       * 搜索条件异常时，不显示任何数据
       */
      this.setRuntimeFilter(new Condition(DEFAULT_FALSE_CONDITION));
      const refreshParameters: TreeRefreshCallChainingParameters = {
        isSkipRefreshSelf: true,
        refreshParent: false,
        currentPage: 1
      };
      this.parentRefreshCallChaining?.syncCall(refreshParameters);
    }
    return false;
  }

  /**
   * 选中节点（查询）
   * @param node 选中节点
   * @protected
   */
  protected async onSelectedForQuery(node: OioTreeNode<CardCascaderItemData>): Promise<boolean> {
    const { metadata, data } = node.value;
    if (!metadata || !data) {
      this.setRuntimeFilter(undefined);
      return false;
    }
    const { model } = metadata;
    const modelDefinition = await ModelCache.get(model);
    if (!modelDefinition) {
      this.setRuntimeFilter(undefined);
      return false;
    }
    const uniqueObject = FetchUtil.generatorUniqueObject(modelDefinition, data);
    const condition = FetchUtil.generatorSimpleCondition(uniqueObject);
    if (!condition) {
      this.setRuntimeFilter(undefined);
      return false;
    }
    this.setRuntimeFilter(condition);
    const refreshParameters: TreeRefreshCallChainingParameters = {
      isSkipRefreshSelf: true,
      refreshParent: false,
      currentPage: 1
    };
    this.currentRefreshCallChaining?.syncCall(refreshParameters);
    return true;
  }

  /**
   * 移除选中
   * @protected
   */
  protected async onUnselected() {
    this.setRuntimeFilter(undefined);
    const refreshParameters: TreeRefreshCallChainingParameters = {
      isSkipRefreshSelf: true,
      refreshParent: false,
      currentPage: 1
    };
    this.parentRefreshCallChaining?.syncCall(refreshParameters);
  }

  protected setRuntimeFilter(filter: string | Condition | undefined) {
    const view = this.metadataRuntimeContext.view;
    if (view) {
      if (filter instanceof Condition) {
        filter = filter.toString();
      } else if (!filter) {
        filter = undefined;
      }
      view.filter = filter;
    }
  }
}

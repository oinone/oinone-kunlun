import {
  type ActiveRecord,
  type ActiveRecords,
  ActiveRecordsOperator,
  getRefreshParameters,
  isM2MField,
  isRelationField,
  type Pagination,
  type QueryContext,
  type QueryPageResult,
  QueryService,
  type QueryVariables,
  RelationUpdateType,
  type RequestModelField,
  resolveDynamicDomain,
  resolveDynamicExpression,
  RuntimeContextManager,
  type RuntimeM2MField,
  SubmitType,
  SubmitValue,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { ActionContextType, type Entity, ViewMode, ViewType } from '@oinone/kunlun-meta';
import { Condition } from '@oinone/kunlun-request';
import { DEFAULT_LIST_TRUE_CONDITION, DEFAULT_TRUE_CONDITION, EDirection, ISort } from '@oinone/kunlun-service';
import {
  BooleanHelper,
  CallChaining,
  debugConsole,
  NumberHelper,
  ObjectUtils,
  Optional,
  type RSQLField,
  RSQLHelper,
  RSQLNodeInfo,
  type SortDirection,
  SortHelper,
  StringHelper,
  TreeNode
} from '@oinone/kunlun-shared';
import type { CheckedChangeEvent, RadioChangeEvent } from '@oinone/kunlun-vue-ui';
import { ListPaginationStyle, ListSelectMode, PageSizeEnum } from '@oinone/kunlun-vue-ui-antd';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ceil, isNil, isString, toInteger, toString } from 'lodash-es';
import { UserPreferEventManager, UserPreferService } from '../../service';
import { fetchPageSize, type UserTablePrefer } from '../../typing';
import { FetchUtil } from '../../util';
import { BaseRuntimePropertiesWidget } from '../common';
import type { QueryExpression, RefreshProcessFunction, UrlQueryParameters } from '../types';
import { BaseElementViewWidget, type BaseElementViewWidgetProps } from './BaseElementViewWidget';
import { generatorCondition, getSortFieldDirection } from './utils';

const URL_SPLIT_SEPARATOR = ',';

export type BaseElementListViewWidgetProps = BaseElementViewWidgetProps;

/**
 * 列表类型数据基础组件（默认使用浏览器参数进行处理）
 */
export abstract class BaseElementListViewWidget<
  Props extends BaseElementListViewWidgetProps = BaseElementListViewWidgetProps
> extends BaseElementViewWidget<Props> {
  public getData(): ActiveRecord[] | undefined {
    return this.dataSource;
  }

  public setData(data: ActiveRecords | undefined, currentPage?: number) {
    this.reloadDataSource(data);
    this.reloadActiveRecords([]);
    const { dataSource } = this;
    if (dataSource) {
      const pagination = this.generatorPagination();
      pagination.current = currentPage || 1;
      pagination.total = dataSource.length;
      pagination.totalPageSize = ceil(dataSource.length / pagination.pageSize);
    }
  }

  /**
   * @deprecated widget finder please this.viewState.fields
   */
  @Widget.Method()
  @Widget.Provide()
  protected fieldWidgetMounted(widget) {}

  /**
   * @deprecated widget finder please this.viewState.fields
   */
  @Widget.Method()
  @Widget.Provide()
  protected fieldWidgetUnmounted(widget) {}

  @Widget.Reactive()
  @Widget.Inject()
  protected checkboxAllCallChaining: CallChaining | undefined;

  /**
   * 搜索数据
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected searchBody: ActiveRecord | undefined;

  /**
   * 搜索表达式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected searchConditions: QueryExpression[] | undefined;

  @Widget.Reactive()
  protected searchCondition: TreeNode<RSQLNodeInfo> | undefined;

  /**
   * 根据搜索内容获取的列表数据
   *
   * @return  {ActiveRecord[]} 列表所有数据
   */
  @Widget.Reactive()
  public get searchSortedDataSource(): ActiveRecord[] | undefined {
    let { dataSource } = this;
    const { searchCondition, sortList } = this;
    if (dataSource) {
      if (this.usingSearchCondition || !this.isDataSourceProvider) {
        // 前端搜索
        if (searchCondition) {
          dataSource = dataSource.filter((v) => RSQLHelper.compute(searchCondition, v));
        }
      }
      if (!this.isDataSourceProvider) {
        // 前端排序
        if (sortList?.length) {
          SortHelper.sort(
            dataSource,
            sortList.map((v) => {
              let direction: SortDirection = 'asc';
              if (v.direction === EDirection.DESC) {
                direction = 'desc';
              }
              return {
                field: v.sortField,
                direction
              };
            })
          );
        }
      }
    }

    return dataSource;
  }

  /**
   *
   * 当前列表展示的数据
   */
  @Widget.Reactive()
  public get showDataSource(): ActiveRecord[] | undefined {
    let { searchSortedDataSource } = this;
    let { pagination } = this;
    if (!this.isDataSourceProvider) {
      // 前端分页
      if (this.showPagination) {
        if (!pagination) {
          pagination = { current: 1, pageSize: this.defaultPageSize } as Pagination;
        }
        const { current, pageSize } = pagination;
        const end = pageSize * current;
        const start = end - pageSize;
        searchSortedDataSource = searchSortedDataSource?.slice(start, end);
      }
    }
    return searchSortedDataSource;
  }

  /**
   * 启用排序
   * @protected
   */
  @Widget.Reactive()
  protected get sortable() {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().sortable)).orElse(true);
  }

  /**
   * 默认排序字段
   * @protected
   * @example "field00003 desc,field00004 desc"
   * @returns [{sortField: "field00003", direction: "desc"}, {sortField: "field00004", direction:"desc"}]
   */
  @Widget.Reactive()
  protected get ordering(): ISort[] | undefined {
    return StringHelper.convertArray(this.getDsl().ordering)?.map((v) => {
      const [sortField, direction] = getSortFieldDirection(v);
      return { sortField, direction };
    });
  }

  /**
   * 排序参数
   * @protected
   */
  @Widget.Provide()
  @Widget.Reactive()
  protected sortList: ISort[] | undefined = undefined;

  @Widget.Reactive()
  protected get showPagination() {
    if (this.paginationStyle === ListPaginationStyle.HIDDEN) {
      return false;
    }
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().showPagination)).orElse(true);
  }

  @Widget.Reactive()
  protected get paginationStyle(): ListPaginationStyle {
    const { paginationStyle } = this.getDsl();
    return paginationStyle || ListPaginationStyle.STANDARD;
  }

  public getPaginationStyle() {
    return this.paginationStyle;
  }

  /**
   * 空数据提示
   */
  @Widget.Reactive()
  protected get emptyText() {
    return this.getDsl().emptyText || translateValueByKey('暂无数据');
  }

  /**
   * 空数据图片
   */
  @Widget.Reactive()
  protected get emptyImage() {
    return this.getDsl().emptyImage || undefined;
  }

  /**
   * 分页参数
   * @protected
   */
  @Widget.Reactive()
  protected pagination: Pagination | undefined;

  public getPagination(): Pagination {
    return (
      this.pagination ||
      ({
        total: 0,
        current: 1
      } as Pagination)
    );
  }

  /**
   * 分页选项
   */
  @Widget.Reactive()
  protected get pageSizeOptions(): number[] {
    const sizeOptions = this.getDsl().pageSizeOptions;
    let options: number[] = [];

    if (typeof sizeOptions === 'string') {
      options = sizeOptions.split(',') as unknown as number[];
    } else {
      options = sizeOptions || [];
    }

    return options.length
      ? options.map((v) => NumberHelper.toNumber(v)).filter((v) => v != null)
      : this.defaultPageSizeOptions;
  }

  @Widget.Reactive()
  protected get defaultPageSizeOptions() {
    return Object.keys(PageSizeEnum)
      .filter((key) => typeof PageSizeEnum[key] === 'number')
      .map((key) => PageSizeEnum[key]);
  }

  /**
   * 默认分页数
   * @protected
   */
  @Widget.Reactive()
  protected get defaultPageSize(): number {
    return fetchPageSize(this.getDsl().defaultPageSize);
  }

  @Widget.Reactive()
  protected get enabledFullScreen(): boolean {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().enabledFullScreen)).orElse(
      this.defaultEnabledFullScreen
    );
  }

  protected get defaultEnabledFullScreen() {
    return true;
  }

  /**
   * 加载函数命名空间
   * @protected
   * @deprecated 不允许手动设置函数命名空间
   */
  @Widget.Reactive()
  public get loadFunctionNamespace(): string {
    let namespace = this.getDsl().loadFunctionNamespace;
    if (!namespace) {
      const { model } = this;
      namespace = model.model;
    }
    if (namespace) {
      return namespace;
    }
    throw new Error(`Invalid load function namespace`);
  }

  /**
   * 加载函数名称，禁用数据加载时会指定为false
   * @protected
   */
  @Widget.Reactive()
  public get loadFunctionFun(): string | undefined {
    return Optional.ofNullable(this.getDsl().load).orElse(this.viewAction?.load);
  }

  /**
   * 获取数据
   * @protected
   */
  public async fetchData(condition?: Condition): Promise<ActiveRecord[]> {
    return ActiveRecordsOperator.repairRecords(await this.load(async () => this.$$fetchData(condition)));
  }

  public async $$fetchData(condition?: Condition): Promise<Entity[]> {
    const finalCondition = this.generatorCondition(condition, this.usingSearchCondition);
    if (this.usingSearchCondition) {
      this.generatorSearchCondition(finalCondition);
    }
    const pagination = this.generatorPagination();
    const sort = this.generatorQuerySort();
    const variables = this.generatorQueryVariables();
    const context = this.generatorQueryContext();
    const result = await this.queryPage(finalCondition, pagination, sort, variables, context);
    pagination.total = result.totalElements;
    pagination.totalPageSize = result.totalPages;
    return result.content;
  }

  public submitCacheProcess(dataSource: ActiveRecord[]) {
    const { submitCache, pagination } = this;
    if (!this.usingSearchCondition && submitCache) {
      const { createRecords, updateRecords } = submitCache.getOperatorResult();
      let filterSize = 0;
      if (this.showPagination && pagination && createRecords.length) {
        let startIndex: number;
        if (pagination.current === 1) {
          startIndex = 0;
        } else {
          startIndex = (pagination.current - 1) * pagination.pageSize - pagination.total;
        }
        let searchCondition: TreeNode<RSQLNodeInfo> | null | undefined;
        for (let i = startIndex; i >= 0 && i < createRecords.length && dataSource.length < pagination.pageSize; i++) {
          const record = createRecords[i];
          if (searchCondition === undefined) {
            const finalCondition = this.generatorCondition();
            searchCondition = this.internalGeneratorSearchCondition(finalCondition);
            if (!searchCondition) {
              searchCondition = null;
            }
          }
          if (record) {
            if (searchCondition) {
              if (RSQLHelper.compute(searchCondition, record)) {
                dataSource.push(record);
              } else {
                filterSize++;
              }
            } else {
              dataSource.push(record);
            }
          } else {
            console.warn('Submit cache exist empty record.', this);
          }
        }
      }
      for (let i = 0; i < dataSource.length; i++) {
        const currentRecord = dataSource[i];
        for (const updateRecord of updateRecords) {
          if (submitCache.isEquals(currentRecord, updateRecord)) {
            dataSource[i] = updateRecord;
            break;
          }
        }
      }
      if (this.showPagination && pagination) {
        pagination.total += createRecords.length - filterSize;
      }
    }
  }

  /**
   * 前端分页，当前页的数据被情况后，需要切换成正确的的分页
   */
  public repairPaginationAfterDelete() {
    if (!this.pagination) {
      return;
    }

    if (!this.showDataSource?.length && this.pagination.current > 1) {
      this.onPaginationChange(this.pagination.current - 1, this.pagination.pageSize);
    }
  }

  @Widget.Method()
  public onPaginationChange(current: number, pageSize: number): void {
    let { pagination } = this;
    if (!pagination) {
      pagination = {} as Pagination;
      this.pagination = pagination;
    }
    pagination.current = current;
    pagination.pageSize = pageSize;
    if (this.inline) {
      this.refreshProcess();
      return;
    }
    this.$router?.push({
      segments: [
        {
          path: 'page',
          parameters: {
            currentPage: toString(current),
            pageSize: toString(pageSize)
          },
          extra: {
            preserveParameter: true
          }
        }
      ]
    });
    this.refreshProcess();
  }

  @Widget.Provide()
  @Widget.Method()
  public onSortChange(sortList: ISort[]): void {
    const sortFields: string[] = [];
    const directions: EDirection[] = [];
    sortList?.forEach(({ sortField, direction }) => {
      if (sortField) {
        direction = direction || EDirection.ASC;
        const field = this.rootRuntimeContext.getModelField(sortField)?.modelField;
        if (field && isRelationField(field)) {
          const targetSortFields = field.sortFields || field.referencesModel?.labelFields;
          if (targetSortFields && targetSortFields.length) {
            targetSortFields.forEach((targetSortField) => {
              StringHelper.append(sortFields, `${sortField}.${targetSortField}`);
              StringHelper.append(directions, direction);
            });
          }
        } else {
          StringHelper.append(sortFields, sortField);
          StringHelper.append(directions, direction);
        }
      }
    });
    const finalSortList: ISort[] = [];
    for (let i = 0; i < sortFields.length; i++) {
      finalSortList.push({
        sortField: sortFields[i],
        direction: directions[i]
      });
    }
    this.sortList = finalSortList;
    if (this.inline) {
      this.refreshProcess();
      return;
    }
    const sortParameters: UrlQueryParameters = {};
    if (finalSortList.length) {
      sortParameters.sortField = sortFields.join(URL_SPLIT_SEPARATOR);
      sortParameters.direction = directions.join(URL_SPLIT_SEPARATOR);
    } else {
      sortParameters.sortField = null;
      sortParameters.direction = null;
    }
    this.$router.push({
      segments: [
        {
          path: 'page',
          parameters: sortParameters,
          extra: {
            preserveParameter: true
          }
        }
      ]
    });
    this.refreshProcess();
  }

  @Widget.Reactive()
  protected get selectable(): boolean {
    return Optional.ofNullable(this.getDsl().selectable).map(BooleanHelper.toBoolean).orElse(true)!;
  }

  @Widget.Reactive()
  protected get selectMode(): ListSelectMode {
    return this.getDsl().selectMode?.toLowerCase?.() || ListSelectMode.checkbox;
  }

  @Widget.Method()
  public onCheckedChange(data: ActiveRecords, event?: CheckedChangeEvent) {
    this.reloadActiveRecords(ActiveRecordsOperator.repairRecords(data, { fillDraftId: false }));
  }

  @Widget.Method()
  public onCheckedAllChange(selected: boolean, data: ActiveRecord[], event?: CheckedChangeEvent) {
    if (selected) {
      this.reloadActiveRecords(data);
    } else {
      this.reloadActiveRecords([]);
    }
  }

  @Widget.Method()
  public onRadioChange(data: ActiveRecord, event?: RadioChangeEvent) {
    this.reloadActiveRecords(ActiveRecordsOperator.repairRecords(data));
  }

  protected executeSearchExpression(searchWidget: BaseRuntimePropertiesWidget, expression: string): string | undefined {
    return resolveDynamicExpression(
      expression,
      searchWidget?.activeRecords?.[0] || {},
      searchWidget?.rootData?.[0] || {},
      searchWidget?.openerActiveRecords?.[0] || {},
      searchWidget?.scene || ''
    );
  }

  public generatorCondition(condition?: Condition, usingSearchCondition?: boolean): Condition {
    this.refreshCondition();

    const { model, activeRecords, rootData, openerActiveRecords, searchConditions, scene, parentViewActiveRecords } =
      this;
    let { domain, filter } = this;
    if (filter) {
      filter = resolveDynamicDomain(
        filter,
        activeRecords?.[0] || {},
        rootData?.[0] || {},
        openerActiveRecords?.[0] || {},
        scene,
        parentViewActiveRecords?.[0] || {}
      );
    }

    if (domain) {
      domain = resolveDynamicDomain(
        domain,
        activeRecords?.[0] || {},
        rootData?.[0] || {},
        openerActiveRecords?.[0] || {},
        scene,
        parentViewActiveRecords?.[0] || {}
      );
    }

    const searchRuntimeContext = this.seekSearchRuntimeContext();
    const finalCondition = generatorCondition(
      searchRuntimeContext,
      this.generatorSearchBody(),
      searchConditions,
      filter,
      domain,
      usingSearchCondition
    );

    if (condition) {
      finalCondition.and(condition);
      finalCondition.setConditionBodyData({
        ...finalCondition.getConditionBodyData(),
        ...condition.getConditionBodyData()
      });
    }

    const { submitCache } = this;
    if (!usingSearchCondition && submitCache) {
      const { deleteRecords } = submitCache.getOperatorResult();
      if (deleteRecords.length) {
        // fixme @zbh 20230406 rsql pk 元组
        model.pks?.forEach((pk) => {
          const deleteCondition = FetchUtil.generatorNotInCondition(deleteRecords, pk);
          if (deleteCondition) {
            finalCondition.and(deleteCondition);
          }
        });
      }
    }

    const queryBody = { ...(this.initialContext || {}) } as Record<string, unknown>;
    this.testInitialContext();
    ObjectUtils.shallowMerge(queryBody, finalCondition.getConditionBodyData() || {});
    finalCondition.setConditionBodyData(queryBody);
    return finalCondition;
  }

  @Widget.Provide()
  @Widget.Method()
  protected generatorSearchBody(): ActiveRecord | undefined {
    const { searchBody } = this;
    if (!searchBody) {
      return undefined;
    }
    const searchRuntimeContext = this.seekSearchRuntimeContext();
    const searchWidget = Widget.select(searchRuntimeContext.handle) as unknown as BaseRuntimePropertiesWidget;
    const finalSearchBody: ActiveRecord = {};
    Object.keys(searchBody).forEach((key) => {
      if (key.startsWith('__')) {
        return;
      }
      const val = searchBody[key];
      if (isString(val)) {
        const computedVal = this.executeSearchExpression(searchWidget, val);
        if (computedVal != null) {
          finalSearchBody[key] = computedVal;
        }
      } else if (val != null) {
        finalSearchBody[key] = val;
      }
    });
    return finalSearchBody;
  }

  protected testInitialContext() {
    debugConsole.run(() => {
      const context = this.initialContext || {};
      const searchFields = this.seekSearchRuntimeContext().getRequestModelFields();
      const fieldNames = searchFields.map((field) => field?.field?.name);
      const validFields = Object.keys(context).filter((key) => !fieldNames.includes(key) && key !== 'isKeepAlive');
      if (validFields.length) {
        debugConsole.warn('当前页面的上下文中可能有未拖入到搜索条件的字段', validFields);
      }
    });
  }

  /**
   * 是否前端搜索
   */
  @Widget.Reactive()
  public get usingSearchCondition(): boolean {
    const usingSearchCondition = BooleanHelper.toBoolean(this.getDsl().usingSearchCondition);
    if (usingSearchCondition != null) {
      return usingSearchCondition;
    }
    const { viewMode, submitType, relationUpdateType } = this;
    const { field } = this.metadataRuntimeContext;
    if (field && isRelationField(field)) {
      // 字段本身就是非关联关系模型存储
      const { store, relationFields, referenceFields } = field;
      if (store || !relationFields?.length || !referenceFields?.length) {
        return true;
      }
    }
    return (
      viewMode !== ViewMode.Lookup &&
      !!field &&
      submitType !== SubmitType.increment &&
      [RelationUpdateType.default, RelationUpdateType.all].includes(relationUpdateType)
    );
  }

  public generatorSearchCondition(condition?: Condition) {
    const searchCondition = this.internalGeneratorSearchCondition(condition);
    if (!searchCondition) {
      this.resetSearchCondition();
      return;
    }
    this.searchCondition = searchCondition;
  }

  protected internalGeneratorSearchCondition(condition?: Condition): TreeNode<RSQLNodeInfo> | undefined {
    const rsql = condition?.toString();

    if (!rsql || rsql === DEFAULT_LIST_TRUE_CONDITION) {
      return undefined;
    }
    const searchCondition = RSQLHelper.parseRSQL(rsql, {
      model: this.model.model,
      fields: (this.seekSearchRuntimeContext()?.model.modelFields || []) as unknown as RSQLField[]
    });
    if (!searchCondition) {
      return undefined;
    }
    return searchCondition;
  }

  public resetSearchCondition() {
    this.searchCondition = undefined;
  }

  protected seekSearchRuntimeContext() {
    const modelModel = this.model.model;
    if (modelModel) {
      const searchRuntimeContext = RuntimeContextManager.getOthers(this.rootHandle)?.find(
        (v) => v.model.model === modelModel && v.view.type === ViewType.Search
      );
      if (searchRuntimeContext) {
        return searchRuntimeContext;
      }
    }
    return this.rootRuntimeContext;
  }

  public generatorPagination(): Pagination {
    let { pagination } = this;
    if (!pagination) {
      pagination = {} as Pagination;
      this.pagination = pagination;
    }
    let { current, pageSize } = pagination;
    current = toInteger(current) || 1;
    pageSize = toInteger(pageSize) || this.defaultPageSize;
    pagination.current = current;
    pagination.pageSize = pageSize;
    return pagination;
  }

  public generatorQuerySort(): ISort[] {
    return this.sortList || [];
  }

  public generatorQueryVariables(variables?: QueryVariables): QueryVariables {
    variables = { ...(variables || {}), ...(this.metadataRuntimeContext.view?.context || {}) };
    if (!variables.scene) {
      variables.scene = this.scene || this.getUrlParameters().action;
    }
    return this.rootRuntimeContext.generatorVariables(variables);
  }

  public generatorQueryContext(context?: QueryContext): QueryContext {
    context = { ...(context || {}) };
    context.__queryParams = {
      ...(context.__queryParams || {}),
      scene: this.scene || this.getUrlParameters().action
    };
    return context;
  }

  public generatorRequestFields(): RequestModelField[] {
    const modelFields = this.rootRuntimeContext.getRequestModelFields();
    const searchFields = this.seekSearchRuntimeContext().getRequestModelFields();
    return Object.values(
      [...modelFields, ...searchFields].reduce((acc, curr) => {
        if (!acc[curr.field.data]) {
          acc[curr.field.data] = curr;
        }
        return acc;
      }, {})
    ) as RequestModelField[];
  }

  public async queryPage<T = ActiveRecord>(
    condition: Condition,
    pagination: Pagination,
    sort: ISort[],
    variables: QueryVariables,
    context: QueryContext
  ): Promise<QueryPageResult<T>> {
    const { field } = this.metadataRuntimeContext;
    if (field && isM2MField(field)) {
      const queryData = this.metadataRuntimeContext.view?.initialValue?.[0];
      if (!queryData) {
        return { content: [], totalPages: 0, totalElements: 0 };
      }
      return this.relationM2MQueryPage(field, queryData, condition, pagination, sort, variables, context);
    }
    if (BooleanHelper.isFalse(this.loadFunctionFun)) {
      this.isDataSourceProvider = false;
      if (this.isExpandView()) {
        return { content: (this.activeRecords || []) as unknown as T[], totalPages: 0, totalElements: 0 };
      }
      const contextType = this.viewAction?.contextType;
      switch (contextType) {
        case ActionContextType.Single: {
          const firstInitialValue = this.initialValue?.[0] as unknown as T;
          let finalInitialValue: T[];
          if (firstInitialValue) {
            finalInitialValue = [firstInitialValue];
          } else {
            finalInitialValue = [];
          }
          return { content: finalInitialValue, totalPages: 0, totalElements: 0 };
        }
        case ActionContextType.Batch:
        case ActionContextType.SingleAndBatch:
          return { content: (this.initialValue || []) as unknown as T[], totalPages: 0, totalElements: 0 };
        default:
          return { content: [], totalPages: 0, totalElements: 0 };
      }
    }
    const requestFields = this.generatorRequestFields();
    return QueryService.queryPage(this.model, {
      requestFields,
      responseFields: requestFields,
      fun: this.loadFunctionFun,
      currentPage: pagination.current,
      pageSize: this.showPagination ? pagination.pageSize : -1,
      sort,
      condition: condition.toString() === DEFAULT_TRUE_CONDITION ? '' : condition,
      variables,
      context
    });
  }

  protected async relationM2MQueryPage<T = ActiveRecord>(
    field: RuntimeM2MField,
    queryData: ActiveRecord,
    condition: Condition,
    pagination: Pagination,
    sort: ISort[],
    variables: QueryVariables,
    context: QueryContext
  ): Promise<QueryPageResult<T>> {
    const requestFields = this.metadataRuntimeContext.parentContext?.getRequestModelFields();
    const responseFields = this.rootRuntimeContext.getRequestModelFields() || [];
    return QueryService.relationQueryPage<T>(field, queryData, this.model, {
      requestFields: requestFields || responseFields,
      responseFields,
      currentPage: pagination.current,
      pageSize: this.showPagination ? pagination.pageSize : -1,
      sort,
      condition: condition.toString() === DEFAULT_TRUE_CONDITION ? '' : condition,
      variables,
      context
    });
  }

  protected async mountedProcess() {
    const { dataSource } = this;
    if (!this.isDataSourceProvider && dataSource && !this.loadFunctionFun) {
      if (this.showPagination) {
        const pagination = this.generatorPagination();
        pagination.total = dataSource.length;
        pagination.totalPageSize = ceil(dataSource.length / pagination.pageSize);
      }
    } else {
      this.isDataSourceProvider = true;
      const newDataSource = await this.fetchData();
      this.submitCacheProcess(newDataSource);
      this.reloadDataSource(newDataSource);
    }
    this.reloadActiveRecords([]);
  }

  @Widget.Method()
  @Widget.Inject('refreshProcess')
  protected parentRefreshProcess: RefreshProcessFunction | undefined;

  // region user prefer

  @Widget.Reactive()
  protected get usingSimpleUserPrefer(): boolean | undefined {
    return BooleanHelper.toBoolean(this.getDsl().usingSimpleUserPrefer);
  }

  protected userPreferEventManager: UserPreferEventManager | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected userPrefer?: UserTablePrefer;

  protected initUserPrefer() {
    this.userPreferEventManager = UserPreferEventManager.get(this.rootHandle || this.currentHandle);
    if (this.inline) {
      this.userPrefer = {} as UserTablePrefer;
    } else {
      this.userPrefer = (UserPreferService.parsePreferForTable(
        this.metadataRuntimeContext.view?.extension?.userPreference as Record<string, unknown>
      ) || {}) as UserTablePrefer;
      this.userPreferEventManager.onSave(this.$saveUserPrefer.bind(this));
    }
    this.userPreferEventManager.setData(this.userPrefer);
    this.userPreferEventManager.onReload(this.$reloadUserPrefer.bind(this), CallChaining.MAX_PRIORITY);
  }

  /**
   *
   * @param userPrefer
   * @deprecated 兼容原有逻辑 使用UserPreferEventManager.INSTANCE.reload方法替换
   */
  @Widget.Provide()
  @Widget.Method()
  public reloadUserPrefer(userPrefer: UserTablePrefer) {
    this.userPreferEventManager?.reload(userPrefer);
  }

  protected $reloadUserPrefer(userPrefer: Partial<UserTablePrefer>) {
    this.userPrefer = { ...(this.userPrefer || {}), ...userPrefer } as UserTablePrefer;
    this.userPreferEventManager?.setData(this.userPrefer);
  }

  protected async $saveUserPrefer(userPrefer: Partial<UserTablePrefer>) {
    const viewName = userPrefer.viewName || this.metadataRuntimeContext.view.name;
    if (viewName) {
      const saveUserPrefer = {
        ...userPrefer,
        model: userPrefer.model || this.metadataRuntimeContext.model.model,
        viewName
      } as UserTablePrefer;
      await UserPreferService.savePreferForTable(saveUserPrefer);
    }
  }

  // endregion user prefer

  @Widget.Method()
  protected async refreshProcess(condition?: Condition) {
    const rootConditionBodyData = this.rootRuntimeContext.view.context?.rootConditionBodyData as Record<
      string,
      unknown
    >;
    if (rootConditionBodyData) {
      if (!condition) {
        condition = new Condition(DEFAULT_TRUE_CONDITION);
      }
      condition.setConditionBodyData(rootConditionBodyData);
    }

    let { isDataSourceProvider } = this;
    if (!isDataSourceProvider && !this.dataSource) {
      this.isDataSourceProvider = true;
      isDataSourceProvider = this.isDataSourceProvider;
    }
    if (isDataSourceProvider || (this.automatic && !this.parentRefreshProcess)) {
      const dataSource = await this.fetchData(condition);
      this.submitCacheProcess(dataSource);
      this.reloadDataSource(dataSource);
      this.repairPaginationAfterDelete();
    } else {
      const finalCondition = this.generatorCondition(condition, this.usingSearchCondition);
      await this.parentRefreshProcess?.(finalCondition);
      this.generatorSearchCondition(finalCondition);
      const { dataSource, searchCondition, searchSortedDataSource } = this;
      if (dataSource) {
        let source = dataSource;
        if (this.usingSearchCondition || !this.isDataSourceProvider) {
          // 前端搜索
          if (searchCondition) {
            source = searchSortedDataSource || [];
          }
        }

        const pagination = this.generatorPagination();
        pagination.total = source.length;
        pagination.totalPageSize = ceil(source.length / pagination.pageSize);
      }
    }
    this.reloadActiveRecords([]);
  }

  /**
   * 初始化排序字段列表页, 优选取url上面的配置，如果没有就取设计器配置
   */
  protected initSortList() {
    const { sortField, direction } = this.urlParameters;
    let { sortList } = this;
    if (!sortList && sortField && direction) {
      sortList = [];
      const sortFields = sortField.split(URL_SPLIT_SEPARATOR);
      const directions = direction.split(URL_SPLIT_SEPARATOR);
      if (sortFields.length && directions.length && sortFields.length === directions.length) {
        for (let i = 0; i < sortFields.length; i++) {
          sortList.push({ sortField: sortFields[i], direction: directions[i] as EDirection });
        }
      }
      this.sortList = sortList;
    }
    if (!sortList && this.ordering?.length) {
      this.sortList = [...this.ordering];
    }
  }

  protected initPagination() {
    const { currentPage, pageSize } = this.urlParameters;
    let { pagination } = this;
    if (!pagination && (currentPage || pageSize)) {
      pagination = {
        current: toInteger(currentPage),
        pageSize: toInteger(pageSize)
      } as Pagination;
      this.pagination = pagination;
    }
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.initSortList();
    this.initPagination();
    this.initUserPrefer();
  }

  protected $$mounted() {
    super.$$mounted();
    this.submitCallChaining?.callBefore(
      () => {
        return new SubmitValue(this.activeRecords);
      },
      { force: true, immutable: false }
    );
    this.checkboxAllCallChaining?.hook(this.path, (args) => {
      const selected = BooleanHelper.toBoolean(args?.[0] as boolean) || false;
      this.onCheckedAllChange(selected, this.showDataSource || []);
    });
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.userPreferEventManager?.dispose();
    this.checkboxAllCallChaining?.unhook(this.path);
  }

  protected async $$executeRefreshCallChaining(args: unknown[] | undefined): Promise<void> {
    const pagination = this.generatorPagination();
    const { condition, currentPage, pageSize } = getRefreshParameters(args);
    if (pagination) {
      if (!isNil(currentPage)) {
        pagination.current = currentPage;
      }
      if (!isNil(pageSize)) {
        pagination.pageSize = pageSize;
      }
    }
    await this.refreshProcess(condition);
  }
}

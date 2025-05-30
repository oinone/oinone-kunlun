import {
  ActiveRecord,
  ActiveRecords,
  ActiveRecordsOperator,
  ConfigHelper,
  getRefreshParameters,
  isM2MField,
  isRelationField,
  Pagination,
  QueryContext,
  QueryPageResult,
  QueryService,
  QueryVariables,
  RelationUpdateType,
  RequestModelField,
  resolveDynamicDomain,
  resolveDynamicExpression,
  RuntimeContextManager,
  RuntimeM2MField,
  SubmitType,
  SubmitValue,
  translateValueByKey
} from '@kunlun/engine';
import { ActionContextType, Entity, ModelFieldType, RuntimeConfig, ViewMode, ViewType } from '@kunlun/meta';
import { Condition, DefaultComparisonOperator } from '@kunlun/request';
import { DEFAULT_LIST_TRUE_CONDITION, DEFAULT_TRUE_CONDITION, EDirection, ISort } from '@kunlun/service';
import {
  BooleanHelper,
  CallChaining,
  CastHelper,
  debugConsole,
  NumberHelper,
  ObjectUtils,
  Optional,
  RSQLHelper,
  RSQLNodeInfo,
  SortDirection,
  SortHelper,
  StringHelper,
  TreeNode
} from '@kunlun/shared';
import { ListPaginationStyle, ListSelectMode, PageSizeEnum } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { ceil, get as getValue, isEmpty, isNil, isString, toInteger, toString } from 'lodash-es';
import { VxeTablePropTypes } from 'vxe-table';
import { fetchPageSize } from '../../typing';
import { FetchUtil } from '../../util';
import { BaseRuntimePropertiesWidget } from '../common';
import { QueryExpression, RefreshProcessFunction, UrlQueryParameters } from '../types';
import { BaseElementViewWidget, BaseElementViewWidgetProps } from './BaseElementViewWidget';
import { generatorCondition, getSortFieldDirection } from './utils';

const URL_SPLIT_SEPARATOR = ',';
const ORDERING_SEPARATOR = ',';
const ORDERING_FIELD_ORDER_SEPARATOR = ' ';
const DEFAULT_ORDERING_ORDER = EDirection.ASC;

export interface ListViewConfig {
  paginationStyle?: ListPaginationStyle;
}

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
   * manifest 中配置的列表配置
   */
  protected getListViewConfig() {
    return ConfigHelper.getConfig(RuntimeConfig.getConfig('listViewConfig')) as ListViewConfig | undefined;
  }

  @Widget.Method()
  @Widget.Provide()
  protected fieldWidgetMounted(widget) {}

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
          dataSource = RsqlFilterExecutor.filter(dataSource, searchCondition);
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

        if (this.paginationStyle === ListPaginationStyle.SCROLL) {
          return searchSortedDataSource;
        }

        const end = pagination.pageSize * pagination.current;
        const start = end - pagination.pageSize;
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
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().sortable)).orElse(false);
  }

  /**
   * 默认排序字段
   * @protected
   * @example "field00003 desc,field00004 desc"
   * @returns [{sortField: "field00003", direction: "desc"}, {sortField: "field00004", direction:"desc"}]
   */
  @Widget.Reactive()
  protected get ordering(): ISort[] | undefined {
    const dsf: string = this.getDsl().ordering;
    if (dsf) {
      const dsfArr = dsf.split(ORDERING_SEPARATOR).filter((v) => !isEmpty(v));
      return dsfArr.map((v: string) => {
        const [sortField, direction] = getSortFieldDirection(v, ORDERING_FIELD_ORDER_SEPARATOR, DEFAULT_ORDERING_ORDER);
        return { sortField, direction };
      });
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get sortConfig(): VxeTablePropTypes.SortConfig {
    const config: VxeTablePropTypes.SortConfig = this.getDsl().sortConfig || {};
    if (!config.remote) {
      config.remote = true;
    }
    return config;
  }

  @Widget.Reactive()
  protected get defaultPageSizeOptions() {
    return Object.keys(PageSizeEnum)
      .filter((key) => typeof PageSizeEnum[key] === 'number')
      .map((key) => PageSizeEnum[key]);
  }

  /**
   * 排序参数
   * @protected
   */
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
    return paginationStyle || this.getListViewConfig()?.paginationStyle || ListPaginationStyle.STANDARD;
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

    return options.length ? options.map((v) => NumberHelper.toNumber(v)) : this.defaultPageSizeOptions;
  }

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
   * 分页参数
   * @protected
   */
  @Widget.Reactive()
  protected pagination: Pagination | undefined;

  /**
   * 默认分页数
   * @protected
   */
  @Widget.Reactive()
  protected get defaultPageSize(): number {
    return fetchPageSize(this.getDsl().defaultPageSize);
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
              if (RsqlFilterExecutor.filter([record], searchCondition).length) {
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
    if (!finalSortList.length) {
      finalSortList.push(...(this.ordering || []));
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

  // 移动端特有逻辑
  @Widget.Reactive()
  @Widget.Inject()
  protected selectMode: ListSelectMode | undefined;

  @Widget.Method()
  public onCheckedChange(data: ActiveRecords) {
    this.reloadActiveRecords(ActiveRecordsOperator.repairRecords(data, { fillDraftId: false }));
  }

  @Widget.Method()
  public onCheckedAllChange(selected: boolean, data: ActiveRecord[]) {
    if (selected) {
      this.reloadActiveRecords(data);
    } else {
      this.reloadActiveRecords([]);
    }
  }

  @Widget.Method()
  public onRadioChange(data: ActiveRecord) {
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

  public generatorCondition(condition?: Condition, usingSearchCondition?: boolean) {
    this.refreshCondition();

    const {
      model,
      activeRecords,
      rootData,
      openerActiveRecords,
      searchBody,
      searchConditions,
      scene,
      parentViewActiveRecords
    } = this;
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
    const searchWidget = Widget.select(searchRuntimeContext.handle) as unknown as BaseRuntimePropertiesWidget;

    const realSearchBody = { ...searchBody };
    Object.keys(realSearchBody).forEach((key) => {
      const val = realSearchBody[key];
      if (isString(val)) {
        const expStr = val as unknown as string;
        realSearchBody[key] = this.executeSearchExpression(searchWidget, expStr);
      }
    });

    const finalCondition = generatorCondition(
      searchRuntimeContext,
      realSearchBody,
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

  public get usingSearchCondition(): boolean {
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
    const searchCondition = RSQLHelper.parse(
      {
        model: this.model.model,
        fields: CastHelper.cast(this.seekSearchRuntimeContext()?.model.modelFields)
      },
      rsql
    );
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
    const modelFields = this.rootRuntimeContext.getRequestModelFields();
    const searchFields = this.seekSearchRuntimeContext().getRequestModelFields();

    const requestFields = Object.values(
      [...modelFields, ...searchFields].reduce((acc, curr) => {
        if (!acc[curr.field.data]) {
          acc[curr.field.data] = curr;
        }
        return acc;
      }, {})
    ) as RequestModelField[];

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

  @Widget.Method()
  protected async refreshProcess(condition?: Condition, reloadData = false) {
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
      let dataSource = await this.fetchData(condition);

      if (this.paginationStyle === ListPaginationStyle.SCROLL && !reloadData) {
        dataSource = [...(this.dataSource || []), ...dataSource];
      }

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

  protected $$beforeMount() {
    super.$$beforeMount();
    const { currentPage, pageSize, sortField, direction } = this.urlParameters;
    let { pagination, sortList } = this;
    if (!pagination && (currentPage || pageSize)) {
      pagination = {
        current: toInteger(currentPage),
        pageSize: toInteger(pageSize)
      } as Pagination;
      this.pagination = pagination;
    }
    if (!sortList && sortField && direction) {
      sortList = [];
      const sortFields = sortField.split(URL_SPLIT_SEPARATOR);
      const directions = direction.split(URL_SPLIT_SEPARATOR);
      if (sortFields.length && directions.length && sortFields.length === directions.length) {
        this.sortConfig.defaultSort = [];
        for (let i = 0; i < sortFields.length; i++) {
          sortList.push({ sortField: sortFields[i], direction: directions[i] as EDirection });
          this.sortConfig.defaultSort.push({
            field: sortFields[i],
            order: directions[i].toLowerCase() as VxeTablePropTypes.SortOrder
          });
        }
      }
      this.sortList = sortList;
    }
    if (!sortList && this.ordering?.length) {
      this.sortList = this.ordering;
    }
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

    await this.refreshProcess(condition, true);
  }
}

type RsqlToObjectItem = {
  value: Array<string | number | boolean>;
  operator: DefaultComparisonOperator;
  ttype: ModelFieldType;
};

interface IRsqlToObject {
  [key: string]: RsqlToObjectItem | RsqlToObjectItem[];
}

class RsqlFilterExecutor {
  public static filter<T extends Record<string, unknown> = Record<string, unknown>>(
    list: T[],
    root: TreeNode<RSQLNodeInfo>
  ): T[] {
    return this.rsqlNodeToCondition(list, root);
  }

  protected static rsqlNodeToCondition<T extends Record<string, unknown>>(
    list: T[],
    root: TreeNode<RSQLNodeInfo>
  ): T[] {
    const { children } = root;

    const realChildren = children.filter((child) => (child.children && child.children.length) || child.value?.field);

    /**
     * 将rsql node tree 转换成正确的数据格式，格式如下。
     *
     * [
     *  {
     *   code: {
     *     value: '110',
     *     ttype: 'STRING'
     *     operator: '=like='
     *   },
     *  },
     *  {
     *   writeDate: {
     *    value: '2023-02-28 10:51:04',
     *    ttype: 'DATETIME'
     *    operator: '=lt='
     *   }
     *  },
     *  {
     *   writeDate: {
     *    value: '2023-02-28 09:51:04',
     *    ttype: 'DATETIME'
     *    operator: '=gt='
     *   }
     *  }
     * ]
     */

    const arr: IRsqlToObject[] = [];

    realChildren.forEach((child) => {
      if (child.children.length === 0) {
        const { selector, operator, field, args } = child.value!;

        /**
         * {value: xxx, operator: 'xxx', ttype: xxx}
         */
        const result = this.buildRsqlToObjectItem({
          value: args![0],
          operator: operator!.symbol! as any,
          ttype: field ? field.ttype : null
        });

        arr.push({
          [selector as string]: result
        });
      } else if (child.value?.type === 1) {
        // 如果 type  === 1 , 那么是 `or` 的查询条件
        const selector = child.children[0].value?.selector as string;

        /**
         * [{value: xxx, operator: 'xxx', ttype: xxx}, {value: xxx, operator: 'xxx', ttype: xxx}]
         */
        const list = child.children.map((c) => {
          const { operator, field, args } = c.value!;
          return this.buildRsqlToObjectItem({
            value: args![0],
            operator: operator!.symbol! as any,
            ttype: field ? field.ttype : null
          });
        });

        arr.push({
          [selector as string]: list
        });
      }
    });

    return this.getFilterResultWithConditionArr(list, arr) as T[];
  }

  protected static buildRsqlToObjectItem({ value, operator, ttype }) {
    return {
      value: this.getValueByTType(value, ttype),
      operator,
      ttype
    };
  }

  protected static getFilterResultWithConditionArr(list, arr: IRsqlToObject[]) {
    const filterArr: ((val: any) => boolean)[] = [];

    arr.forEach((obj) => {
      Object.keys(obj).forEach((key) => {
        filterArr.push((dataSourceItem) => {
          const conditionObject = obj[key];

          /**
           * 如果当前条件是数组，那么是 `or` 查询
           */
          if (Array.isArray(conditionObject)) {
            const [k, relationK] = key.split('.');
            const itemValue = getValue<any[]>(dataSourceItem, k, []).map((v) => v[relationK]);
            return itemValue === null ? false : conditionObject.some((v) => this.executeOperator(v, itemValue));
          }

          let itemValue: null | any[] | Record<string, any> = null;
          if ([ModelFieldType.ManyToMany, ModelFieldType.OneToMany].includes(conditionObject.ttype)) {
            const [k, relationK] = key.split('.');
            itemValue = getValue<any[]>(dataSourceItem, k, []).map((v) => v[relationK]);
          } else {
            itemValue = getValue(dataSourceItem, key, null);
          }

          return this.executeOperator(conditionObject, itemValue);
        });
      });
    });

    return filterArr.reduce((pre, next) => {
      return pre?.filter(next);
    }, list);
  }

  /**
   * 通过 `条件` + `table每一行`，执行对应的操作
   */
  protected static executeOperator(obj: RsqlToObjectItem, dataSourceItem) {
    if (dataSourceItem === null) {
      return false;
    }

    const realValue = this.getValueByTType(dataSourceItem, obj.ttype);

    if (obj.operator === DefaultComparisonOperator.GREATER_THAN) {
      return realValue > obj.value;
    }

    if (obj.operator === DefaultComparisonOperator.GREATER_THAN_OR_EQUAL) {
      return realValue >= obj.value;
    }

    if (obj.operator === DefaultComparisonOperator.LESS_THAN) {
      return realValue < obj.value;
    }

    if (obj.operator === DefaultComparisonOperator.LESS_THAN_OR_EQUAL) {
      return realValue < obj.value;
    }

    if ([ModelFieldType.ManyToMany, ModelFieldType.OneToMany].includes(obj.ttype)) {
      return realValue.includes(obj.value);
    }

    if (obj.operator === DefaultComparisonOperator.LIKE) {
      return realValue.indexOf(obj.value) > -1;
    }

    if (obj.operator === DefaultComparisonOperator.NOT_LIKE) {
      return realValue.indexOf(obj.value) === -1;
    }

    if (obj.operator === DefaultComparisonOperator.STARTS) {
      return realValue.startsWith(obj.value);
    }

    if (obj.operator === DefaultComparisonOperator.NOT_STARTS) {
      return !realValue.startsWith(obj.value);
    }

    if (obj.operator === DefaultComparisonOperator.ENDS) {
      return realValue.endsWith(obj.value);
    }

    if (obj.operator === DefaultComparisonOperator.NOT_ENDS) {
      return !realValue.endsWith(obj.value);
    }

    if (obj.operator === DefaultComparisonOperator.IS_NULL) {
      return realValue === null;
    }

    if (obj.operator === DefaultComparisonOperator.NOT_NULL) {
      return realValue !== null;
    }

    if (obj.operator === DefaultComparisonOperator.EQUAL) {
      return realValue === obj.value;
    }

    if (obj.operator === DefaultComparisonOperator.NOT_EQUAL) {
      return realValue !== obj.value;
    }

    throw new TypeError(`搜索失败，不支持${obj.operator}搜索`);
  }

  /**
   * 根据 ttype，将value变成正确的值
   *   时间类型，就要转成时间戳
   */
  protected static getValueByTType(value, ttype: ModelFieldType) {
    switch (ttype) {
      case ModelFieldType.Date:
      case ModelFieldType.DateTime:
        return new Date(value).getTime();

      default:
        return value;
    }
  }
}

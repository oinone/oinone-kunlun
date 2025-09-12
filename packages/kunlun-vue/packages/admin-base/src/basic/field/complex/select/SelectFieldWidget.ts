import {
  ActiveRecord,
  ActiveRecords,
  ActiveRecordsOperator,
  Pagination,
  QueryContext,
  QueryPageResult,
  QueryService,
  QueryVariables,
  QueryWrapper,
  RequestModelField,
  RuntimeRelationField
} from '@oinone/kunlun-engine';
import { GraphqlHelper, RSQLCondition } from '@oinone/kunlun-shared';
import { SelectItem, SelectMode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormComplexFieldProps } from '../FormComplexFieldWidget';
import { BaseSelectFieldWidget } from './BaseSelectFieldWidget';

export class SelectFieldWidget<
  Option extends ActiveRecord = ActiveRecord,
  Value extends ActiveRecords = ActiveRecords,
  Field extends RuntimeRelationField = RuntimeRelationField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends BaseSelectFieldWidget<Value, Field, Props> {
  @Widget.Reactive()
  protected mode: SelectMode = SelectMode.single;

  @Widget.Reactive()
  protected get bizStyle(): string | undefined {
    return this.getDsl().bizStyle;
  }

  @Widget.Method()
  protected async initLoad() {
    if (!this.options || this.lastDomain !== this.domain) {
      await this.$$initLoad();
    }
  }

  protected async $$initLoad(condition?: RSQLCondition) {
    this.pagination = undefined;
    const data = await this.fetchData(condition);
    const options: SelectItem<Option>[] = this.dataSource?.map((v) => this.mapping(v as Option)) || [];
    for (const item of data) {
      options.push(this.mapping(item));
    }
    this.options = options;
  }

  @Widget.Method()
  protected async loadMore() {
    const pagination = this.generatorPagination();
    if ((pagination.totalPageSize || 0) > pagination.current) {
      pagination.current++;
      const data = await this.fetchData();
      const options = [...(this.options || [])];
      for (const item of data) {
        options.push(this.mapping(item));
      }
      this.options = options;
    } else {
      this.loadCompleted = true;
    }
  }

  @Widget.Method()
  protected async search(keyword: string): Promise<void> {
    if (!keyword) {
      this.options = undefined;
      return;
    }
    keyword = GraphqlHelper.serializableSearchString(keyword);
    let { searchFields } = this;
    if (!searchFields.length) {
      searchFields = ['name'];
    }
    const condition = RSQLCondition.wrapper();
    for (const searchField of searchFields) {
      condition.or().like(searchField, keyword, "'");
    }
    await this.$$initLoad(condition);
  }

  @Widget.Reactive()
  protected get selected(): SelectItem<Option> | SelectItem<Option>[] | null | undefined {
    const value = this.value as unknown as Option | Option[] | null | undefined;
    if (value == null) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((v) => this.mapping(v));
    }
    return this.mapping(value);
  }

  @Widget.Method()
  protected get initSelectedOptions(): SelectItem[] {
    return this.dataSource?.map((v) => this.mapping(v)) || [];
  }

  @Widget.Reactive()
  protected options: SelectItem<Option>[] | undefined;

  protected async fetchData(condition?: RSQLCondition): Promise<Option[]> {
    this.loadMoreLoading = true;
    try {
      return await this.$$fetchData(condition);
    } finally {
      this.loadMoreLoading = false;
    }
  }

  protected async $$fetchData(condition?: RSQLCondition): Promise<Option[]> {
    const finalCondition = this.generatorCondition(condition);
    const queryData = this.generatorQueryData();
    const pagination = this.generatorPagination();
    const variables = this.generatorQueryVariables();
    const context = this.generatorQueryContext();
    const result = await this.queryPage<Option>(
      this.generatorRequestFields(),
      {
        rsql: finalCondition.toString(),
        queryData
      },
      pagination,
      variables,
      context
    );
    pagination.total = result.totalElements;
    pagination.totalPageSize = result.totalPages;
    return ActiveRecordsOperator.repairRecords(result.content) as Option[];
  }

  protected async queryPage<T extends Record<string, unknown>>(
    requestFields: RequestModelField[],
    queryWrapper: QueryWrapper,
    pagination: Pagination,
    variables: QueryVariables,
    context: QueryContext
  ): Promise<QueryPageResult<T>> {
    const { referencesModel } = this;
    if (!referencesModel) {
      console.error('references model not found.');
      return { content: [], totalPages: 0, totalElements: 0 };
    }
    return QueryService.queryPage(referencesModel, {
      fun: this.loadFunctionFun,
      requestFields,
      currentPage: pagination.current,
      pageSize: this.isFetchAll ? -1 : pagination.pageSize,
      queryWrapper,
      variables,
      context
    });
  }
}

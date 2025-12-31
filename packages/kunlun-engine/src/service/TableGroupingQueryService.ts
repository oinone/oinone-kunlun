import { GQL, GQLResponseParameterBuilder } from '@oinone/kunlun-request';
import { GraphqlHelper } from '@oinone/kunlun-shared';
import { RequestModelField } from '../runtime-context';
import { RuntimeModel } from '../runtime-metadata';
import { ActiveRecord } from '../typing';
import { FunctionService } from './FunctionService';
import { FunctionMetadata, GroupingData, GroupingField, GroupingStatisticField } from './metadata';
import { QueryPageOptions, QueryService, QueryWrapperOptions } from './QueryService';
import { RequestHelper } from './util/request-helper';

export interface TableGroupingWrapperOptions extends QueryWrapperOptions {
  fields: GroupingField[];
  statisticField?: GroupingStatisticField;
}

export interface TableGroupingPageOptions extends QueryPageOptions {
  fields: GroupingField[];
  responseFields: RequestModelField[];
}

export interface TableGroupingResult {
  totalElements: number;
  totalPages: number;
  expandedAll: boolean;
  groups: GroupingData[];
}

export class TableGroupingQueryService {
  public static async queryGroupingPage(
    model: RuntimeModel,
    options: TableGroupingPageOptions
  ): Promise<TableGroupingResult> {
    const { fields, responseFields } = options;
    const deep = fields.length;
    const { queryWrapper, pagination } = QueryService.buildQueryPageParameters(options);
    return GQL.query(model.name, 'queryGroupingPage')
      .buildRequest((builder) => {
        builder
          .buildObjectParameter('page', (builder) =>
            builder.numberParameter('currentPage', pagination.currentPage).numberParameter('size', pagination.size)
          )
          .buildObjectParameter('wrapper', (builder) =>
            builder
              .buildObjectParameter('queryWrapper', (builder) => {
                builder.stringParameter('model', model.model);
                const { rsql, queryData } = queryWrapper;
                if (rsql) {
                  builder.stringParameter('rsql', rsql);
                }
                if (queryData) {
                  builder.stringParameter('queryData', GraphqlHelper.serializableObject(queryData));
                }
                const { sort } = pagination;
                if (sort) {
                  builder.buildObjectParameter('sort', (builder) =>
                    builder.buildArrayParameter('orders', sort.orders, (builder, order) =>
                      builder.stringParameter('field', order.field).enumerationParameter('direction', order.direction)
                    )
                  );
                }
              })
              .buildArrayParameter('fields', fields, (builder, field) => {
                builder.stringParameter('field', field.field);
                builder.enumerationParameter('direction', field.direction);
              })
              .buildObjectParameter('gqlFields', (builder) => {
                RequestHelper.buildGQLRequestParameterFields(builder, responseFields);
              })
          );
      })
      .buildResponse((builder) => {
        builder.parameter('totalElements', 'totalPages', 'expandedAll');
        builder.buildParameters('groups', (builder) => {
          TableGroupingQueryService.buildResponseGroups(builder, deep);
        });
      })
      .request(model.moduleName, options.variables, options.context);
  }

  private static buildResponseGroups(builder: GQLResponseParameterBuilder, deep: number) {
    if (deep >= 1) {
      const fields = ['field', 'value', 'isJsonValue', 'isLeaf'];
      if (deep === 1) {
        fields.push('data');
      }
      builder.parameter(...fields);
      if (deep >= 2) {
        builder.buildParameters('groups', (builder) => {
          TableGroupingQueryService.buildResponseGroups(builder, deep - 1);
        });
      }
    }
  }

  public static async queryGroupingDataByWrapper<T = ActiveRecord>(
    model: RuntimeModel,
    options: TableGroupingWrapperOptions
  ): Promise<T[]> {
    const { queryWrapper } = QueryService.buildQueryWrapperParameters(options);
    const { requestFields, responseFields, fun, variables, context } = options;
    return FunctionService.INSTANCE.simpleExecute<T[]>(
      model,
      await FunctionService.fetchFunctionDefinition(model, fun, FunctionMetadata.queryGroupingDataByWrapper),
      {
        requestModels: QueryService.generatorInternalRequestModels(),
        responseModels: QueryService.generatorInternalResponseModels(),
        requestFields,
        responseFields,
        variables,
        context
      },
      {
        queryWrapper,
        fields: options.fields
      }
    );
  }

  public static async queryGroupingStatistic(
    model: RuntimeModel,
    options: TableGroupingWrapperOptions
  ): Promise<string> {
    const { queryWrapper } = options;
    const { requestFields, responseFields, fun, variables, context } = options;
    return FunctionService.INSTANCE.simpleExecute<string>(
      model,
      await FunctionService.fetchFunctionDefinition(model, fun, FunctionMetadata.queryGroupingStatistic),
      {
        requestModels: QueryService.generatorInternalRequestModels(),
        responseModels: QueryService.generatorInternalResponseModels(),
        requestFields,
        responseFields,
        variables,
        context
      },
      {
        queryWrapper,
        fields: options.fields,
        statisticField: options.statisticField
      }
    );
  }
}

import { ModelFieldType } from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import { ISort } from '@kunlun/service';
import { isArray, toInteger } from 'lodash-es';
import { FunctionCache, ModelCache } from '../cache';
import { RELATION_2M_FIELD_TTYPES, RELATION_2O_FIELD_TTYPES } from '../runtime-context';
import { RuntimeModel, RuntimeRelationField } from '../runtime-metadata';
import { ActiveRecord, ActiveRecords } from '../typing';
import { FunctionOptions, FunctionService } from './FunctionService';
import {
  FunctionMetadata,
  QueryPageResult,
  QueryPagination,
  QuerySort,
  QueryWrapper,
  StaticMetadata
} from './metadata';

export interface QueryOptions extends FunctionOptions {
  fun?: string;
}

export interface QueryConstructOptions extends QueryOptions {
  isSameModel: boolean;
  usingModelCache?: boolean;
}

export interface QueryWrapperOptions extends QueryOptions {
  condition?: Condition | string;
}

export interface QueryPageOptions extends QueryWrapperOptions {
  currentPage: number;
  pageSize: number;

  sort?: ISort[] | ISort;
  groupBy?: string;
}

export class QueryService {
  public static async constructOne<T = ActiveRecord>(
    model: RuntimeModel,
    queryData: ActiveRecords,
    options: QueryConstructOptions
  ): Promise<T> {
    const { requestFields, responseFields, fun, isSameModel, usingModelCache, variables, context } = options;
    const finalFun = fun || 'construct';
    const functionDefinition = await FunctionCache.get(model.model, finalFun);
    if (!functionDefinition) {
      console.error('Invalid construct function definition.');
      return undefined as unknown as T;
    }

    const { argumentList } = functionDefinition;
    const args: unknown[] = [];
    const models: string[] = [];
    if (argumentList.length === 1) {
      const [argument] = argumentList;
      if (Array.isArray(queryData)) {
        if (RELATION_2M_FIELD_TTYPES.includes(argument.ttype as ModelFieldType)) {
          args.push(queryData);
        } else if (RELATION_2O_FIELD_TTYPES.includes(argument.ttype as ModelFieldType)) {
          args.push({});
        } else {
          args.push(null);
        }
      } else if (RELATION_2O_FIELD_TTYPES.includes(argument.ttype as ModelFieldType)) {
        args.push(queryData);
      } else {
        args.push(null);
      }
    } else {
      for (const functionArgument of argumentList) {
        const { ttype: argumentTtype, model: argumentModel } = functionArgument;
        const ttype = argumentTtype as ModelFieldType;
        if (isSameModel === (argumentModel === model.model)) {
          if (RELATION_2M_FIELD_TTYPES.includes(ttype)) {
            if (!isArray(queryData)) {
              queryData = [queryData];
            }
          }
          if (argumentModel) {
            models.push(argumentModel);
          }
          args.push(queryData);
        } else if (RELATION_2O_FIELD_TTYPES.includes(ttype)) {
          args.push({});
        } else if (RELATION_2M_FIELD_TTYPES.includes(ttype)) {
          args.push([]);
        } else {
          args.push(undefined);
        }
      }
    }

    const requestModels: RuntimeModel[] = [];
    if (!isSameModel) {
      const otherModel = models[0];
      if (otherModel) {
        if (usingModelCache) {
          const modelDefinition = await ModelCache.get(otherModel);
          if (modelDefinition) {
            requestModels.push(modelDefinition);
          }
        } else {
          requestModels.push({
            ...StaticMetadata.IdModel,
            model: otherModel
          });
        }
      }
    }

    return FunctionService.INSTANCE.simpleExecute<T>(
      model,
      functionDefinition,
      {
        requestModels,
        requestFields,
        responseFields,
        variables,
        context
      },
      ...args
    );
  }

  public static async constructMirror<T = ActiveRecord>(
    model: RuntimeModel,
    queryData: ActiveRecord,
    options: QueryOptions
  ): Promise<T> {
    const { requestFields, responseFields, fun, variables, context } = options;
    const finalFun = fun || 'constructMirror';
    const functionDefinition = await FunctionCache.get(model.model, finalFun);
    if (!functionDefinition) {
      console.error('Invalid construct function definition.');
      return undefined as unknown as T;
    }
    return FunctionService.INSTANCE.simpleExecute<T>(
      model,
      functionDefinition,
      {
        requestFields,
        responseFields,
        variables,
        context
      },
      queryData
    );
  }

  public static async queryOne<T = ActiveRecord>(
    model: RuntimeModel,
    queryData: ActiveRecord,
    options: QueryOptions
  ): Promise<T> {
    const { requestFields, responseFields, fun, variables, context } = options;
    return FunctionService.INSTANCE.simpleExecute<T>(
      model,
      await FunctionService.fetchFunctionDefinition(model, fun, FunctionMetadata.queryOne),
      {
        requestModels: QueryService.generatorInternalRequestModels(),
        responseModels: QueryService.generatorInternalResponseModels(),
        requestFields,
        responseFields,
        variables,
        context
      },
      queryData
    );
  }

  public static async queryOneByWrapper<T = ActiveRecord>(
    model: RuntimeModel,
    options: QueryWrapperOptions
  ): Promise<T> {
    const { queryWrapper } = QueryService.buildQueryWrapperParameters(options);
    const { requestFields, responseFields, fun, variables, context } = options;
    return FunctionService.INSTANCE.simpleExecute<T>(
      model,
      await FunctionService.fetchFunctionDefinition(model, fun, FunctionMetadata.queryOneByWrapper),
      {
        requestModels: QueryService.generatorInternalRequestModels(),
        responseModels: QueryService.generatorInternalResponseModels(),
        requestFields,
        responseFields,
        variables,
        context
      },
      queryWrapper
    );
  }

  public static async queryPage<T = ActiveRecord>(
    model: RuntimeModel,
    options: QueryPageOptions
  ): Promise<QueryPageResult<T>> {
    const { queryWrapper, pagination } = QueryService.buildQueryPageParameters(options);
    const { requestFields, responseFields, fun, variables, context } = options;
    const data = await FunctionService.INSTANCE.simpleExecute<QueryPageResult<T>>(
      model,
      await FunctionService.fetchFunctionDefinition(model, fun, FunctionMetadata.queryPage),
      {
        requestModels: QueryService.generatorInternalRequestModels(),
        responseModels: QueryService.generatorInternalResponseModels(),
        requestFields,
        responseFields,
        variables,
        context
      },
      pagination,
      queryWrapper
    );

    const { content, totalElements, totalPages } = data;

    return {
      content,
      totalElements: toInteger(totalElements),
      totalPages: toInteger(totalPages)
    };
  }

  public static async relationQueryPage<T = ActiveRecord>(
    field: RuntimeRelationField,
    queryData: ActiveRecord,
    referencesModel: RuntimeModel,
    options: QueryPageOptions
  ): Promise<QueryPageResult<T>> {
    const { queryWrapper, pagination } = QueryService.buildQueryPageParameters(options);
    const { requestFields, responseFields, fun, variables, context } = options;
    const data = await FunctionService.INSTANCE.simpleExecute<QueryPageResult<T>>(
      referencesModel,
      await FunctionService.fetchFunctionDefinition(referencesModel, fun, FunctionMetadata.relationQueryPage),
      {
        requestModels: QueryService.generatorInternalRequestModels(),
        responseModels: QueryService.generatorInternalResponseModels(),
        requestFields,
        responseFields,
        variables,
        context
      },
      pagination,
      queryWrapper,
      field.model,
      field.data,
      queryData
    );

    const { content, totalElements, totalPages } = data;

    return {
      content,
      totalElements: toInteger(totalElements),
      totalPages: toInteger(totalPages)
    };
  }

  public static generatorInternalRequestModels(): RuntimeModel[] {
    return [StaticMetadata.QueryPagination, StaticMetadata.QueryWrapper, StaticMetadata.ResourceAddress];
  }

  public static generatorInternalResponseModels(): RuntimeModel[] {
    return [StaticMetadata.QueryPageResult, StaticMetadata.ResourceAddress];
  }

  public static readonly INTERNAL_REQUEST_MODELS = QueryService.generatorInternalRequestModels().map((v) => v.model);

  public static readonly INTERNAL_RESPONSE_MODELS = QueryService.generatorInternalResponseModels().map((v) => v.model);

  public static buildQueryWrapperParameters(options: QueryWrapperOptions) {
    let { condition } = options;
    let queryData: ActiveRecord | undefined;
    if (condition instanceof Condition) {
      queryData = condition.getConditionBodyData();
      condition = condition.toString();
    }

    const queryWrapper: QueryWrapper = {
      rsql: condition,
      queryData
    };

    return {
      queryWrapper
    };
  }

  public static buildQueryPageParameters(options: QueryPageOptions): {
    queryWrapper: QueryWrapper;
    pagination: QueryPagination;
  } {
    const { queryWrapper } = QueryService.buildQueryWrapperParameters(options);
    const { currentPage, pageSize, sort, groupBy } = options;

    const pagination: QueryPagination = {
      currentPage: currentPage || 1,
      size: pageSize || -1
    };

    let sortList: ISort[] | undefined;
    let querySort: QuerySort[] | undefined;
    if (sort) {
      querySort = [];
      if (Array.isArray(sort)) {
        sortList = sort;
      } else {
        sortList = [sort];
      }
      sortList.forEach((v) => {
        querySort!.push({
          field: v.sortField,
          direction: v.direction
        });
      });
      if (querySort.length) {
        pagination.sort = { orders: querySort };
      }
    }

    if (groupBy) {
      pagination.groupBy = groupBy;
    }

    return {
      queryWrapper,
      pagination
    };
  }
}

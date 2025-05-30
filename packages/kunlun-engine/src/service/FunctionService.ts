import { ModelFieldType } from '@kunlun/meta';
import {
  generatorGQLResponseParameterMap,
  GQL,
  GQLBuilder,
  GQLRequestParameterBuilder,
  GQLResponseParameter,
  GQLResponseParameterBuilder,
  GQLResponseParameterMap,
  isGQLResponseParameterMap
} from '@kunlun/request';
import { BigNumber, BooleanHelper, GraphqlHelper } from '@kunlun/shared';
import { isArray, toString } from 'lodash-es';
import { FunctionCache, MemoryCache } from '../cache';
import {
  DATETIME_FIELD_TTYPES,
  getRealTtype,
  isRelatedField,
  isRelation2MField,
  isRelation2OField,
  isRelationField,
  NUMBER_FIELD_TTYPES,
  RELATION_2M_FIELD_TTYPES,
  RELATION_2O_FIELD_TTYPES,
  RequestModelField,
  STRING_FIELD_TTYPES
} from '../runtime-context';
import {
  FunctionSelfFlag,
  FunctionSelfFlagType,
  FunctionType,
  RuntimeFunctionArgument,
  RuntimeFunctionDefinition,
  RuntimeFunctionReturnType,
  RuntimeModel,
  RuntimeModelField,
  RuntimeRelatedField,
  RuntimeRelationField
} from '../runtime-metadata';
import { StaticMetadata } from './metadata';
import { QueryContext, QueryVariables } from './typing';

const STRING_PARAMETER_TYPES = [...STRING_FIELD_TTYPES, ...DATETIME_FIELD_TTYPES];

export interface FunctionOptions {
  /**
   * 请求参数对象用到的模型
   */
  requestModels?: RuntimeModel[];
  /**
   * 响应对象用到的模型
   */
  responseModels?: RuntimeModel[];

  /**
   * 请求的字段列表
   */
  requestFields: RequestModelField[];
  /**
   * 响应的字段列表
   */
  responseFields?: RequestModelField[];

  /**
   * 请求中附带的变量
   */
  variables?: QueryVariables;
  /**
   * 请求的上下文配置
   */
  context?: QueryContext;

  /**
   * GQL响应深度
   */
  deep?: number;
}

/**
 * 函数执行可选项
 */
export interface FunctionExecuteOptions {
  /**
   * 模型编码
   */
  model: string;
  /**
   * 模型名称
   */
  modelName: string;
  /**
   * <h3>请求字段集合</h3>
   * <p>
   *   key: model -> value: {@link RequestModelField[]}
   * </p>
   */
  requestFields: Record<string, RequestModelField[]>;
  /**
   * <h3>响应字段集合</h3>
   * <p>
   *   key: model -> value: {@link RequestModelField[]}
   * </p>
   */
  responseFields: Record<string, RequestModelField[]>;
  /**
   * 模块名称
   */
  moduleName?: string;
  /**
   * 请求参数
   */
  variables?: QueryVariables;
  /**
   * 请求上下文
   */
  context?: QueryContext;

  /**
   * GQL响应深度
   */
  deep?: number;
}

export class FunctionService {
  public static INSTANCE = new FunctionService();

  public static async fetchFunctionDefinition(
    model: RuntimeModel,
    fun: string | undefined,
    defaultValue: RuntimeFunctionDefinition
  ): Promise<RuntimeFunctionDefinition> {
    const { fun: defaultFun } = defaultValue;
    let finalFun;
    if (BooleanHelper.toBoolean(fun) === undefined) {
      finalFun = fun || defaultFun;
    } else {
      finalFun = defaultFun;
    }
    let functionDefinition: RuntimeFunctionDefinition = defaultValue;
    if (fun && finalFun !== defaultFun) {
      const customFunctionDefinition = await FunctionCache.get(model.model, fun);
      if (customFunctionDefinition) {
        functionDefinition = customFunctionDefinition;
      }
    }
    return functionDefinition;
  }

  public async execute<T>(
    model: RuntimeModel,
    functionDefinition: RuntimeFunctionDefinition,
    options: FunctionExecuteOptions,
    ...args
  ): Promise<T> {
    const { moduleName, variables, context } = options;
    return this.buildGQLByFunction(functionDefinition, options, ...args).request<T>(
      moduleName || model.moduleName,
      variables,
      context
    );
  }

  public async simpleExecute<T>(
    model: RuntimeModel,
    functionDefinition: RuntimeFunctionDefinition,
    options: FunctionOptions,
    ...args: unknown[]
  ): Promise<T> {
    const { requestModels, responseModels, requestFields, responseFields, variables, context, deep } = options;

    const { model: modelModel, name: modelName } = model;
    const requestFieldsMap = { [modelModel]: requestFields };
    for (const requestModel of requestModels || []) {
      requestFieldsMap[requestModel.model] = requestModel.modelFields.map((field) => ({ field }));
    }

    const responseFieldsMap = { [modelModel]: responseFields || requestFields };
    for (const responseModel of responseModels || []) {
      responseFieldsMap[responseModel.model] = responseModel.modelFields.map((field) => ({ field }));
    }

    const simpleExecuteOptions: FunctionExecuteOptions = {
      model: modelModel,
      modelName,
      requestFields: requestFieldsMap,
      responseFields: responseFieldsMap,

      variables,
      context,
      deep
    };

    return this.execute(model, functionDefinition, simpleExecuteOptions, ...args);
  }

  public buildGQLByFunction(
    functionDefinition: RuntimeFunctionDefinition,
    options: FunctionExecuteOptions,
    ...args: unknown[]
  ): GQLBuilder {
    const { type, name, argumentList, returnType } = functionDefinition;
    const { modelName } = options;
    let builder: GQLBuilder;
    if (type.length === 1 && type[0] === FunctionType.QUERY) {
      builder = GQL.query(modelName, name);
    } else {
      builder = GQL.mutation(modelName, name);
    }
    builder.buildRequest((requestBuilder) => {
      for (let i = 0; i < args.length; i++) {
        const argumentDefinition = argumentList[i];
        const argumentValue = args[i];
        if (!argumentDefinition || argumentValue === undefined) {
          continue;
        }
        const { name: argumentName } = argumentDefinition;
        if (argumentValue === null) {
          requestBuilder.nullParameter(argumentName);
        } else {
          this.buildRequestParameterByArgument(options, requestBuilder, argumentDefinition, argumentValue);
        }
      }
    });
    if (!returnType) {
      return builder;
    }
    builder.buildResponse((responseBuilder) => {
      this.buildResponseParameterByReturnType(options, responseBuilder, returnType);
    });
    return builder;
  }

  public buildRequestParameterByArgument(
    options: FunctionExecuteOptions,
    builder: GQLRequestParameterBuilder,
    argumentDefinition: RuntimeFunctionArgument,
    value: unknown
  ): void {
    const { name, ttype, multi, model, modelDefinition } = argumentDefinition;
    if (this.predictSelfFlag(options, ttype, model)) {
      const requestFields = options.requestFields[options.model];
      if (isArray(value)) {
        builder.buildArrayParameter(name, value as object[], (relation2OBuilder, singleValue) => {
          this.buildRequestParameters(options, relation2OBuilder, requestFields!, singleValue);
        });
      } else {
        builder.buildObjectParameter(name, (relation2OBuilder) => {
          this.buildRequestParameters(options, relation2OBuilder, requestFields!, value as object);
        });
      }
    } else if (STRING_PARAMETER_TYPES.includes(ttype)) {
      builder.stringParameter(name, value, true);
    } else if (NUMBER_FIELD_TTYPES.includes(ttype)) {
      this.buildNumberRequestParameter(builder, ttype, multi, name, value as number | string);
    } else if (ttype === ModelFieldType.Boolean) {
      builder.booleanParameter(name, value);
    } else if (ttype === ModelFieldType.Enum) {
      builder.enumerationParameter(name, value);
    } else if (ttype === ModelFieldType.Map) {
      this.buildMapRequestParameter(builder, multi, name, value as object | object[]);
    } else {
      let requestFields: RequestModelField[] | undefined = modelDefinition?.modelFields.map((field) => ({ field }));
      if (!requestFields?.length && model) {
        requestFields = options.requestFields[model];
      }
      if (!requestFields?.length) {
        return;
      }
      if (RELATION_2O_FIELD_TTYPES.includes(ttype)) {
        builder.buildObjectParameter(name, (relation2OBuilder) => {
          this.buildRequestParameters(options, relation2OBuilder, requestFields!, value as object);
        });
      } else if (RELATION_2M_FIELD_TTYPES.includes(ttype)) {
        builder.buildArrayParameter(name, value as object[], (relation2MBuilder, singleValue) => {
          this.buildRequestParameters(options, relation2MBuilder, requestFields!, singleValue);
        });
      }
    }
  }

  public buildRequestParameters(
    options: FunctionExecuteOptions,
    builder: GQLRequestParameterBuilder,
    requestFields: RequestModelField[],
    value: object
  ): void {
    const keys = Object.keys(value);
    if (keys.length >= requestFields.length * 0.75) {
      for (const requestField of requestFields) {
        this.buildRequestParameterByField(options, builder, requestField, value);
      }
    } else {
      for (const key of keys) {
        const requestField = requestFields.find((v) => v.field.data === key);
        if (requestField) {
          this.buildRequestParameterByField(options, builder, requestField, value);
        }
      }
    }
  }

  public buildRequestParameterByField(
    options: FunctionExecuteOptions,
    builder: GQLRequestParameterBuilder,
    requestField: RequestModelField,
    value: object
  ): void {
    const { field, referencesFields } = requestField;
    const { name, ttype, multi, isVirtual } = field;
    if (isVirtual) {
      this.pushVirtualMetadataByField(options, field);
    }
    if (value === null) {
      builder.nullParameter(name);
      return;
    }
    if (value === undefined) {
      return;
    }
    const realTtype = getRealTtype(field);
    if (STRING_PARAMETER_TYPES.includes(realTtype)) {
      builder.stringParameter(name, value[name], true);
    } else if (NUMBER_FIELD_TTYPES.includes(realTtype)) {
      this.buildNumberRequestParameter(builder, realTtype, multi, name, value[name]);
    } else if (realTtype === ModelFieldType.Boolean) {
      builder.booleanParameter(name, value[name]);
    } else if (realTtype === ModelFieldType.Enum) {
      builder.enumerationParameter(name, value[name]);
    } else if (realTtype === ModelFieldType.Map) {
      this.buildMapRequestParameter(builder, multi, name, value[name]);
    } else {
      const referencesValues: object | object[] | null | undefined = value[name];
      if (referencesValues === undefined) {
        return;
      }
      const { references } = field as RuntimeRelationField;
      const isSelfFlag = this.predictSelfFlag(options, ttype, references);
      let referencesRequestFields = referencesFields || options.requestFields[references];
      const staticRequestModelFields = this.getStaticRequestModelFields(references);
      if (staticRequestModelFields) {
        referencesRequestFields = staticRequestModelFields;
      }
      if (!referencesRequestFields && isSelfFlag) {
        referencesRequestFields = options.requestFields[options.model];
      }
      if (referencesRequestFields?.length) {
        if (isArray(referencesValues)) {
          if (referencesValues.length) {
            builder.buildArrayParameter(name, referencesValues, (relation2OBuilder, referencesValue) => {
              this.buildRequestParameters(options, relation2OBuilder, referencesRequestFields!, referencesValue);
            });
          } else {
            builder.nullArrayParameter(name);
          }
        } else if (referencesValues) {
          builder.buildObjectParameter(name, (relation2OBuilder) => {
            this.buildRequestParameters(options, relation2OBuilder, referencesRequestFields!, referencesValues);
          });
        } else {
          builder.nullParameter(name);
        }
      } else if (isRelation2OField(field)) {
        if (referencesValues) {
          const referencesModelFields = field.referencesModel?.modelFields;
          if (referencesModelFields?.length) {
            builder.buildObjectParameter(name, (relation2OBuilder) => {
              referencesModelFields.forEach((referencesRequestField) => {
                this.buildRequestParameterByField(
                  options,
                  relation2OBuilder,
                  { field: referencesRequestField },
                  referencesValues as object
                );
              });
            });
          }
        } else {
          builder.nullParameter(name);
        }
      } else if (isRelation2MField(field)) {
        if ((referencesValues as object[]).length) {
          const referencesModelFields = field.referencesModel?.modelFields;
          if (referencesModelFields?.length) {
            builder.buildArrayParameter(name, referencesValues as object[], (relation2MBuilder, referencesValue) => {
              referencesModelFields.forEach((referencesRequestField) => {
                this.buildRequestParameterByField(
                  options,
                  relation2MBuilder,
                  { field: referencesRequestField },
                  referencesValue
                );
              });
            });
          }
        } else {
          builder.nullArrayParameter(name);
        }
      }
    }
  }

  protected buildNumberRequestParameter(
    builder: GQLRequestParameterBuilder,
    ttype: ModelFieldType,
    multi: boolean | undefined,
    name: string,
    value: number | string
  ): void {
    if (multi || [ModelFieldType.Long, ModelFieldType.Currency].includes(ttype)) {
      builder.stringParameter(name, value);
    } else if (value == null) {
      builder.stringParameter(name, value);
    } else {
      const numberValue = new BigNumber(toString(value));
      if (!numberValue.isNaN()) {
        builder.numberParameter(name, numberValue.toString());
      }
    }
  }

  protected buildMapRequestParameter(
    builder: GQLRequestParameterBuilder,
    multi: boolean | undefined,
    name: string,
    value: object | object[] | null | undefined
  ): void {
    let mapStringValue: string | null | undefined;
    if (value) {
      if (multi) {
        if (!isArray(value)) {
          value = [value];
        }
        mapStringValue = GraphqlHelper.serializableObjectArray(value as object[]);
      } else if (isArray(value)) {
        mapStringValue = GraphqlHelper.serializableObjectArray(value);
      } else {
        mapStringValue = GraphqlHelper.serializableObject(value as object);
      }
    } else {
      mapStringValue = value;
    }
    builder.stringParameter(name, mapStringValue);
  }

  protected buildResponseParameterByReturnType(
    options: FunctionExecuteOptions,
    builder: GQLResponseParameterBuilder,
    returnType: RuntimeFunctionReturnType
  ): void {
    const { ttype, model, modelDefinition } = returnType;
    let responseFields: RequestModelField[] | undefined;
    if (modelDefinition) {
      responseFields = modelDefinition.modelFields.map((field) => ({ field }));
    } else if (this.predictSelfFlag(options, ttype, model)) {
      responseFields = options.responseFields[options.model];
    } else if (model) {
      const staticRequestModelFields = this.getStaticRequestModelFields(model);
      if (staticRequestModelFields) {
        responseFields = staticRequestModelFields;
      } else {
        responseFields = options.responseFields[model];
      }
    }
    if (!responseFields) {
      return;
    }
    let { deep } = options;
    if (deep) {
      if (StaticMetadata.QueryPageResult.model === model) {
        deep++;
      }
      this.buildResponseParametersWithDeep(options, builder, responseFields, deep);
    } else {
      this.buildResponseParameters(options, builder, responseFields);
    }
  }

  protected buildResponseParameters(
    options: FunctionExecuteOptions,
    builder: GQLResponseParameterBuilder,
    responseFields: RequestModelField[],
    modelStack?: string[]
  ): void {
    if (!modelStack) {
      modelStack = [];
    }
    const relatedFields: RequestModelField[] = [];
    for (const responseField of responseFields) {
      this.buildResponseParameterByField(options, builder, responseField, modelStack);
      if (isRelatedField(responseField.field)) {
        relatedFields.push(responseField);
      }
    }
    for (const relatedField of relatedFields) {
      this.buildResponseParameterByRelatedField(options, builder, relatedField);
    }
  }

  protected buildResponseParameterByField(
    options: FunctionExecuteOptions,
    builder: GQLResponseParameterBuilder,
    responseField: RequestModelField,
    modelStack: string[]
  ): void {
    const { field, referencesFields } = responseField;
    const { name, ttype, isVirtual } = field;
    if (isVirtual) {
      this.pushVirtualMetadataByField(options, field);
    }
    const { references } = field as RuntimeRelationField;
    const isSelfFlag = this.predictSelfFlag(options, ttype);
    if (isSelfFlag || isRelationField(field)) {
      let isPushStack = false;
      let referencesResponseFields = referencesFields;
      const staticRequestModelFields = this.getStaticRequestModelFields(references);
      if (staticRequestModelFields) {
        referencesResponseFields = staticRequestModelFields;
        if (modelStack.some((v) => v === references)) {
          return;
        }
        modelStack.push(references);
        isPushStack = true;
      }
      if (!referencesResponseFields) {
        let targetReference: string | undefined;
        if (isSelfFlag) {
          targetReference = options.model;
        } else if (references) {
          targetReference = references;
        }
        if (targetReference) {
          referencesResponseFields = options.responseFields[targetReference];
          if (modelStack.some((v) => v === targetReference)) {
            return;
          }
          modelStack.push(targetReference);
          isPushStack = true;
        }
      }
      if (!referencesResponseFields || !referencesResponseFields.length) {
        if (isPushStack) {
          modelStack.pop();
        }
        return;
      }
      builder.buildParameters(name, (relationBuilder) => {
        this.buildResponseParameters(options, relationBuilder, referencesResponseFields!, modelStack);
        if (isPushStack) {
          modelStack.pop();
        }
      });
    } else {
      builder.parameter(name);
    }
  }

  protected buildResponseParametersWithDeep(
    options: FunctionExecuteOptions,
    builder: GQLResponseParameterBuilder,
    responseFields: RequestModelField[],
    deep: number
  ): void {
    if (deep < 0) {
      return;
    }
    const relatedFields: RequestModelField[] = [];
    for (const responseField of responseFields) {
      this.buildResponseParameterByFieldWithDeep(options, builder, responseField, deep);
      if (isRelatedField(responseField.field)) {
        relatedFields.push(responseField);
      }
    }
    for (const relatedField of relatedFields) {
      this.buildResponseParameterByRelatedField(options, builder, relatedField);
    }
  }

  protected buildResponseParameterByFieldWithDeep(
    options: FunctionExecuteOptions,
    builder: GQLResponseParameterBuilder,
    responseField: RequestModelField,
    deep: number
  ): void {
    const { field, referencesFields } = responseField;
    const { name, ttype, isVirtual } = field;
    if (isVirtual) {
      this.pushVirtualMetadataByField(options, field);
    }
    const { references } = field as RuntimeRelationField;
    const isSelfFlag = this.predictSelfFlag(options, ttype);
    if (isSelfFlag || isRelationField(field)) {
      let referencesResponseFields = referencesFields;
      const staticRequestModelFields = this.getStaticRequestModelFields(references);
      if (staticRequestModelFields) {
        referencesResponseFields = staticRequestModelFields;
      }
      if (!referencesResponseFields) {
        let targetReference: string | undefined;
        if (isSelfFlag) {
          targetReference = options.model;
        } else if (references) {
          targetReference = references;
        }
        if (targetReference) {
          referencesResponseFields = options.responseFields[targetReference];
        }
      }
      if (!referencesResponseFields || !referencesResponseFields.length) {
        return;
      }
      builder.buildParameters(name, (relationBuilder) => {
        this.buildResponseParametersWithDeep(options, relationBuilder, referencesResponseFields!, deep - 1);
      });
    } else {
      builder.parameter(name);
    }
  }

  protected buildResponseParameterByRelatedField(
    options: FunctionExecuteOptions,
    builder: GQLResponseParameterBuilder,
    responseField: RequestModelField
  ): void {
    const field = responseField.field as RuntimeRelatedField;
    if (field.isVirtual) {
      return;
    }
    let parameters: GQLResponseParameter | GQLResponseParameterMap = builder.getParameters();
    const relatedFields = field.related;
    if (!relatedFields) {
      console.error('Invalid related field', field);
      return;
    }
    const lastedIndex = relatedFields.length - 1;
    for (let i = 0; i < relatedFields.length; i++) {
      const relatedField = relatedFields[i];
      if (i === lastedIndex) {
        if (isGQLResponseParameterMap(parameters)) {
          if (!parameters[relatedField]) {
            parameters[relatedField] = this.buildResponseParametersByRelatedField(responseField, relatedField);
          }
        } else if (Array.isArray(parameters)) {
          const target = parameters[1];
          if (isGQLResponseParameterMap(target)) {
            if (!target[relatedField]) {
              target[relatedField] = this.buildResponseParametersByRelatedField(responseField, relatedField);
            }
          } else if (Array.isArray(target)) {
            if (!target.includes(relatedField)) {
              target.push(relatedField);
            }
          } else {
            console.error('Invalid related field', field);
          }
        }
      } else if (isGQLResponseParameterMap(parameters)) {
        let nextParameters: GQLResponseParameter | GQLResponseParameterMap = parameters[relatedField];
        if (!nextParameters) {
          nextParameters = [relatedField, generatorGQLResponseParameterMap()];
          parameters[relatedField] = nextParameters;
        }
        parameters = nextParameters;
      } else if (Array.isArray(parameters)) {
        const responseParameterMap = parameters[1];
        if (isGQLResponseParameterMap(responseParameterMap)) {
          let nextParameters = responseParameterMap[relatedField];
          if (!nextParameters) {
            nextParameters = generatorGQLResponseParameterMap();
            responseParameterMap[relatedField] = nextParameters;
          }
          parameters[relatedField] = nextParameters;
          parameters = nextParameters;
        }
      }
    }
  }

  protected buildResponseParametersByRelatedField(
    responseField: RequestModelField,
    relatedField: string
  ): GQLResponseParameter {
    const { field, referencesFields } = responseField;
    if (isRelationField(field)) {
      const { references } = field as RuntimeRelationField;
      const parameters = generatorGQLResponseParameterMap();
      let referencesResponseFields = referencesFields;
      const staticRequestModelFields = this.getStaticRequestModelFields(references);
      if (staticRequestModelFields) {
        referencesResponseFields = staticRequestModelFields;
      }
      for (const referencesResponseField of referencesResponseFields || []) {
        const { field: referencesField } = referencesResponseField;
        if (!isRelationField(referencesField)) {
          const { name } = referencesField;
          parameters[name] = name;
        }
      }
      return [relatedField, parameters];
    }
    return relatedField;
  }

  protected predictSelfFlag(
    options: FunctionExecuteOptions,
    ttype: ModelFieldType | FunctionSelfFlagType,
    model?: string
  ): ttype is FunctionSelfFlagType {
    return ttype === FunctionSelfFlag || options.model === model;
  }

  protected getStaticRequestModelFields(model: string): RequestModelField[] | undefined {
    if (!model) {
      return undefined;
    }
    return StaticRequestModelFieldsCache.INSTANCE.get(model);
  }

  protected pushVirtualMetadataByField(options: FunctionExecuteOptions, field: RuntimeModelField) {
    let { variables } = options;
    if (!variables) {
      variables = {};
      options.variables = variables;
    }
    let { metadata } = variables;
    if (!metadata) {
      metadata = {};
      variables.metadata = metadata;
    }
    const { model } = field;
    let virtualModel = metadata[model];
    if (!virtualModel) {
      virtualModel = {
        model,
        fields: {}
      };
      metadata[model] = virtualModel;
    }
    const { data } = field;
    if (virtualModel.fields[data]) {
      return;
    }
    if (isRelatedField(field)) {
      virtualModel.fields[data] = field.related.join('.');
    } else if (isRelationField(field)) {
      const { ttype, references, relationFields, referenceFields } = field;
      virtualModel.fields[data] = {
        ttype,
        references,
        relationFields,
        referenceFields
      };
    } else {
      const { ttype } = field;
      virtualModel.fields[data] = { ttype };
    }
  }
}

class StaticRequestModelFieldsCache extends MemoryCache<string, RequestModelField[]> {
  public static INSTANCE = new StaticRequestModelFieldsCache();

  private static StaticModels: RuntimeModel[] = [StaticMetadata.ResourceAddress];

  public fetchValue(key: string): RequestModelField[] | undefined {
    const staticModel = StaticRequestModelFieldsCache.StaticModels.find((v) => v.model === key);
    if (!staticModel) {
      return undefined;
    }
    return this.runtimeModelConvertRequestModelFields(staticModel);
  }

  public runtimeModelConvertRequestModelFields(model: RuntimeModel): RequestModelField[] {
    const requestModelFields: RequestModelField[] = [];
    model.modelFields.forEach((field) => {
      const target: RequestModelField = { field };
      const referenceModel = field.modelDefinition;
      if (referenceModel) {
        target.referencesFields = this.runtimeModelConvertRequestModelFields(referenceModel);
      }
      requestModelFields.push(target);
    });
    return requestModelFields;
  }
}

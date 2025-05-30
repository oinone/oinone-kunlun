import { isComplexTtype, ModelFieldType } from '@kunlun/meta';
import { FunctionCache, ModelCache } from '../cache';
import { isRelationField, RequestModelField } from '../runtime-context';
import { RuntimeFunctionDefinition, RuntimeModel } from '../runtime-metadata';
import { FunctionOptions, FunctionService } from './FunctionService';
import { StaticMetadata } from './metadata';
import { QueryService } from './QueryService';

/**
 * 函数的调用配置项
 */
export interface GenericFunctionOptions extends Omit<FunctionOptions, 'requestFields'> {
  /**
   * 请求的字段列表
   */
  requestFields?: RequestModelField[];
  /**
   * 模型
   */
  model?: RuntimeModel;
  /**
   * 模型编码
   */
  modelModel?: string;
  /**
   * GQL响应深度
   */
  deep?: number;
  /**
   * 在指定请求字段时，根据指定查询深度再进行自动填充
   */
  autoFill?: boolean;
}

export class GenericFunctionService {
  public static INSTANCE = new GenericFunctionService();

  /**
   * 函数执行
   * @param functionDefinition 函数定义
   * @param options 请求的配置
   * @param args 请求的入参
   */
  public async execute<T>(
    functionDefinition: RuntimeFunctionDefinition,
    options: GenericFunctionOptions,
    ...args: unknown[]
  ): Promise<T | undefined> {
    let modelDefinition = options.model;
    if (!modelDefinition) {
      const modelModel = options.modelModel || functionDefinition.namespace;
      modelDefinition = await ModelCache.get(modelModel);
    }
    if (!modelDefinition) {
      console.error('Invalid model definition.');
      return undefined;
    }

    let { requestFields } = options;
    const { autoFill, deep } = options;
    let requestModels: RuntimeModel[] | undefined;
    let responseModels: RuntimeModel[] | undefined;
    if (requestFields) {
      if (autoFill) {
        requestFields = await this.autoFillModelFields(requestFields, deep || 0);
      }
      const res = await this.collectionFunctionParameterModels(modelDefinition, functionDefinition, true, deep || 0);
      requestModels = res.requestModels;
      responseModels = res.responseModels;
    } else {
      requestFields = [];
      const res = await this.collectionFunctionParameterModels(modelDefinition, functionDefinition, false, deep || 0);
      requestModels = res.requestModels;
      responseModels = res.responseModels;
    }

    return FunctionService.INSTANCE.simpleExecute(
      modelDefinition,
      functionDefinition,
      {
        ...options,
        requestModels: [
          ...QueryService.generatorInternalRequestModels(),
          ...(requestModels || []),
          ...(options.requestModels || [])
        ],
        responseModels: [
          ...QueryService.generatorInternalResponseModels(),
          ...(responseModels || []),
          ...(options.responseModels || options.requestModels || [])
        ],
        requestFields,
        responseFields: options.responseFields || requestFields
      },
      ...args
    );
  }

  /**
   * 函数执行
   * @param namespace 函数的命名空间，一般情况是模型编码
   * @param fun 函数的方法名称
   * @param options 请求的配置
   * @param args 请求的入参
   */
  public async executeByFun<T>(
    namespace: string,
    fun: string,
    options: GenericFunctionOptions,
    ...args: unknown[]
  ): Promise<T | undefined> {
    const functionDefinition = await FunctionCache.get(namespace, fun);
    if (!functionDefinition) {
      console.error(`Invalid function definition. namespace=${namespace}, fun=${fun}`);
      return undefined;
    }
    return this.execute(functionDefinition, options, ...args);
  }

  /**
   * 函数执行
   * @param namespace 函数的命名空间，一般情况是模型编码
   * @param name 函数的名称
   * @param options 请求的配置
   * @param args 请求的入参
   */
  public async executeByName<T>(
    namespace: string,
    name: string,
    options: GenericFunctionOptions,
    ...args: unknown[]
  ): Promise<T | undefined> {
    const functionDefinition = await FunctionCache.getByName(namespace, name);
    if (!functionDefinition) {
      console.error(`Invalid function definition. namespace=${namespace}, name=${name}`);
      return undefined;
    }
    return this.execute(functionDefinition, options, ...args);
  }

  public async simpleExecute<T>(
    functionDefinition: RuntimeFunctionDefinition,
    ...args: unknown[]
  ): Promise<T | undefined> {
    return this.execute(functionDefinition, {}, ...args);
  }

  public async simpleExecuteByFun<T>(namespace: string, fun: string, ...args: unknown[]): Promise<T | undefined> {
    const functionDefinition = await FunctionCache.get(namespace, fun);
    if (!functionDefinition) {
      console.error(`Invalid function definition. namespace=${namespace}, fun=${fun}`);
      return undefined;
    }
    return this.simpleExecute(functionDefinition, ...args);
  }

  public async simpleExecuteByName<T>(namespace: string, name: string, ...args: unknown[]): Promise<T | undefined> {
    const functionDefinition = await FunctionCache.getByName(namespace, name);
    if (!functionDefinition) {
      console.error(`Invalid function definition. namespace=${namespace}, name=${name}`);
      return undefined;
    }
    return this.simpleExecute(functionDefinition, ...args);
  }

  protected async collectionFunctionParameterModels(
    currentModel: RuntimeModel,
    functionDefinition: RuntimeFunctionDefinition,
    isFilterCurrentModel: boolean,
    deep: number
  ): Promise<{ requestModels: RuntimeModel[]; responseModels: RuntimeModel[] }> {
    const { argumentList, returnType } = functionDefinition;
    const responseModels: Promise<RuntimeModel | undefined>[] = [];
    const repeatSet: Record<string, Promise<RuntimeModel | undefined>> = {
      [currentModel.model]: Promise.resolve(currentModel)
    };
    if (returnType) {
      const { ttype, model } = returnType;
      if (isComplexTtype(ttype as ModelFieldType)) {
        if (model) {
          if (QueryService.INTERNAL_RESPONSE_MODELS.includes(model)) {
            if (StaticMetadata.QueryPageResult.model === model) {
              responseModels.push(Promise.resolve(currentModel));
            }
          } else if (!isFilterCurrentModel || currentModel.model !== model) {
            const modelDefinition = ModelCache.get(model);
            repeatSet[model] = modelDefinition;
            responseModels.push(modelDefinition);
          }
        }
      }
    }
    const requestModels: Promise<RuntimeModel | undefined>[] = [];
    for (const argument of argumentList) {
      const { ttype, model } = argument;
      if (isComplexTtype(ttype as ModelFieldType)) {
        if (model) {
          if (QueryService.INTERNAL_REQUEST_MODELS.includes(model)) {
            if (StaticMetadata.QueryPagination.model === model) {
              requestModels.push(Promise.resolve(currentModel));
            }
          } else if (!isFilterCurrentModel || currentModel.model !== model) {
            let modelDefinition = repeatSet[model];
            if (modelDefinition) {
              requestModels.push(modelDefinition);
            } else {
              modelDefinition = ModelCache.get(model);
              repeatSet[model] = modelDefinition;
            }
            requestModels.push(modelDefinition);
          }
        }
      }
    }
    return {
      requestModels: await this.collectionParameterModels(
        await Promise.all(requestModels),
        deep,
        (model) => !QueryService.INTERNAL_REQUEST_MODELS.includes(model)
      ),
      responseModels: await this.collectionParameterModels(
        await Promise.all(responseModels),
        deep,
        (model) => !QueryService.INTERNAL_RESPONSE_MODELS.includes(model)
      )
    };
  }

  private async collectionParameterModels(
    models: (RuntimeModel | undefined)[],
    deep: number,
    filter: (model: string) => boolean
  ): Promise<RuntimeModel[]> {
    const finalModels: RuntimeModel[] = [];
    const nextModels: Promise<RuntimeModel | undefined>[] = [];
    for (const model of models) {
      if (!model) {
        continue;
      }
      finalModels.push(model);
      if (deep <= 0) {
        continue;
      }
      for (const modelField of model.modelFields) {
        if (isRelationField(modelField)) {
          const { references } = modelField;
          if (filter(references)) {
            nextModels.push(ModelCache.get(references));
          }
        }
      }
    }
    if (nextModels.length > 0) {
      finalModels.push(
        ...(await this.collectionParameterModels(
          await Promise.all(nextModels),
          deep - 1,
          (model) => !finalModels.find((v) => v.model === model) && filter(model)
        ))
      );
    }
    return finalModels;
  }

  private async collectionModelFields(model: RuntimeModel, deep: number): Promise<RequestModelField[]> {
    return Promise.all(
      model.modelFields.map(async (v) => {
        const target: RequestModelField = { field: v };
        if (deep > 0 && isRelationField(v)) {
          const referenceModel = await ModelCache.get(v.references);
          if (referenceModel) {
            target.referencesFields = await this.collectionModelFields(referenceModel, deep - 1);
          }
        }
        return target;
      })
    );
  }

  private async autoFillModelFields(requestFields: RequestModelField[], deep: number): Promise<RequestModelField[]> {
    return Promise.all(
      requestFields.map(async (v) => {
        const { field, referencesFields } = v;
        if (deep > 0 && isRelationField(field) && !referencesFields) {
          const referenceModel = await ModelCache.get(field.references);
          if (referenceModel) {
            v.referencesFields = await this.collectionModelFields(referenceModel, deep - 1);
          }
        }
        return v;
      })
    );
  }
}

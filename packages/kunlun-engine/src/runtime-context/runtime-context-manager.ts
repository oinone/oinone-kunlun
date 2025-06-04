import { Handler, Manager, ObjectUtils } from '@oinone/kunlun-shared';
import { RouterPath, RuntimeModelField } from '../runtime-metadata';
import {
  deepResolve,
  generatorVariables,
  getDefaultValue,
  getInitialValue,
  getRequestFields,
  getRequestModelFields,
  transfer
} from './method';
import { GetModelFieldResult, GetModelResult, RuntimeContext } from './runtime-context';

export const ROOT_HANDLE = '__ROOT_HANDLE__';

/**
 * 运行时上下文内置方法
 */
const runtimeContextMethods: Record<string, Function> = {
  getModel,
  getModelField,
  createFieldRuntimeContext,
  deepResolve,
  transfer,
  generatorVariables,
  getDefaultValue,
  getInitialValue,
  getRequestFields,
  getRequestModelFields
};

class InternalRuntimeContextManager extends Manager<RuntimeContext> {
  public constructor() {
    super();
  }

  protected generator(): RuntimeContext {
    const newContext = {
      frameworkInstance: RuntimeContextManager.get(ROOT_HANDLE)?.frameworkInstance,
      routers: [] as RouterPath[],
      extendData: {}
    } as RuntimeContext;
    const methodKeys: string[] = [];
    for (const [method, fn] of Object.entries(runtimeContextMethods)) {
      methodKeys.push(method);
      newContext[method] = fn.bind(newContext);
    }
    return ObjectUtils.readonly(newContext, methodKeys);
  }
}

/**
 * 运行时上下文管理器
 */
export class RuntimeContextManager {
  private static manager = new InternalRuntimeContextManager();

  /**
   * 获取运行时上下文
   * @param handle 唯一键
   */
  public static get(handle = ROOT_HANDLE): RuntimeContext | undefined {
    return RuntimeContextManager.manager.get(handle);
  }

  /**
   * 获取除了指定handle和根之外的其他运行时上下文
   * @param handle 唯一键
   * @param isBelong 是否仅获取属于相同元数据上下文的其他上下文
   */
  public static getOthers(handle = ROOT_HANDLE, isBelong = true): RuntimeContext[] {
    const others: RuntimeContext[] = [];
    let filter: string[] = [ROOT_HANDLE];
    let belongRuntimeContext: RuntimeContext | undefined;
    if (handle !== ROOT_HANDLE) {
      const currentRuntimeContext = RuntimeContextManager.get(handle);
      if (isBelong && currentRuntimeContext) {
        belongRuntimeContext = currentRuntimeContext;
      }
      filter = [...filter, handle];
    }
    RuntimeContextManager.manager.forEach((v, k) => {
      if (!filter.includes(k)) {
        if (belongRuntimeContext) {
          if (RuntimeContextManager.isBelongRuntimeContext(v, belongRuntimeContext.handle)) {
            others.push(v);
          }
        } else {
          others.push(v);
        }
      }
    });
    return others;
  }

  /**
   * 创建或替换运行时上下文
   * @param handle 唯一键
   * @param parent 父上下文
   */
  public static createOrReplace<Framework = unknown>(
    handle = ROOT_HANDLE,
    parent?: RuntimeContext
  ): RuntimeContext<Framework> {
    return RuntimeContextManager.manager.createOrReplace(handle, parent) as RuntimeContext<Framework>;
  }

  /**
   * 获取或创建运行时上下文
   * @param handle 唯一键
   * @param parent 父上下文
   */
  public static getOrCreate(handle = ROOT_HANDLE, parent?: RuntimeContext): RuntimeContext {
    const context = RuntimeContextManager.get(handle);
    if (!context) {
      return RuntimeContextManager.createOrReplace(handle, parent);
    }
    return context;
  }

  public static delete(handle: string | undefined, deep = true) {
    if (!handle) {
      return;
    }
    RuntimeContextManager.manager.delete(handle, deep);
  }

  public static clearRuntimeContext() {
    const iterator = RuntimeContextManager.manager.keys();
    let next = iterator.next();
    while (!next.done) {
      const key = next.value;
      if (key !== ROOT_HANDLE) {
        RuntimeContextManager.manager.delete(key);
      }
      next = iterator.next();
    }
  }

  private static isBelongRuntimeContext(context: RuntimeContext, belongHandle: string): boolean {
    let next = context.parentContext;
    while (next) {
      if (next.handle === belongHandle) {
        return true;
      }
      next = next.parentContext;
    }
    return false;
  }

  public static generatorFieldRuntimeContextHandle(context: RuntimeContext, field: RuntimeModelField) {
    return `${context.handle}#${field.model}#${field.name}#${field.__index}`;
  }

  public static onCreate(fn: Handler<RuntimeContext>) {
    RuntimeContextManager.manager.onCreate(fn);
  }

  public static onReplace(fn: Handler<RuntimeContext>) {
    RuntimeContextManager.manager.onReplace(fn);
  }

  public static onDelete(fn: Handler<RuntimeContext>) {
    RuntimeContextManager.manager.onDelete(fn);
  }
}

function getModel(this: RuntimeContext, model: string, isBelong = true): GetModelResult | undefined {
  const runtimeModel = this.model;
  if (runtimeModel && model === runtimeModel.model) {
    return {
      model: runtimeModel,
      runtimeContext: this,
      isOther: false
    };
  }
  const others = RuntimeContextManager.getOthers(this.handle, isBelong);
  for (const other of others) {
    const otherRuntimeModel = other.model;
    if (otherRuntimeModel && model === otherRuntimeModel.model) {
      return {
        model: otherRuntimeModel,
        runtimeContext: other,
        isOther: true
      };
    }
  }
}

function getModelField(this: RuntimeContext, data: string, isBelong = true): GetModelFieldResult | undefined {
  const runtimeModel = this.model;
  if (!runtimeModel) {
    return undefined;
  }
  const { model, modelFields } = runtimeModel;
  let modelField = modelFields.find((v) => v.data === data);
  if (modelField) {
    return {
      modelField,
      runtimeContext: this,
      isOther: false
    };
  }
  const others = RuntimeContextManager.getOthers(this.handle, isBelong);
  for (const other of others) {
    const otherRuntimeModel = other.model;
    if (!otherRuntimeModel) {
      continue;
    }
    const { model: otherModel, modelFields: otherModelFields } = otherRuntimeModel;
    if (otherModel === model) {
      modelField = otherModelFields.find((v) => v.data === data);
      if (modelField) {
        return {
          modelField,
          runtimeContext: other,
          isOther: true
        };
      }
    }
  }
  return undefined;
}

function createFieldRuntimeContext(this: RuntimeContext, field: RuntimeModelField): RuntimeContext {
  const fieldRuntimeContextHandle = RuntimeContextManager.generatorFieldRuntimeContextHandle(this, field);
  const runtimeContext = RuntimeContextManager.createOrReplace(fieldRuntimeContextHandle, this);
  runtimeContext.field = field;
  return runtimeContext;
}

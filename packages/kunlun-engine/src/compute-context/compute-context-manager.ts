import { Manager, ObjectUtils } from '@kunlun/shared';
import { RuntimeContextManager } from '../runtime-context';
import { ComputeContext } from './compute-context';
import { compute, resolveCompute } from './method';

/**
 * 运行时上下文内置方法
 */
const computeContextMethods: Record<string, Function> = {
  resolveCompute,
  compute
};

class InternalComputeContextManager extends Manager<ComputeContext> {
  public constructor() {
    super();
  }

  protected generator(handle: string): ComputeContext {
    const newComputeContext = {
      runtimeContext: RuntimeContextManager.get(handle)
    } as ComputeContext;
    const methodKeys: string[] = [];
    Object.entries(computeContextMethods).forEach(([method, fn]) => {
      methodKeys.push(method);
      newComputeContext[method] = fn.bind(newComputeContext);
    });
    return ObjectUtils.readonly(newComputeContext, methodKeys);
  }
}

export class ComputeContextManager {
  private static manager = new InternalComputeContextManager();

  /**
   * 获取计算上下文
   * @param handle 唯一键
   */
  public static get(handle: string): ComputeContext | undefined {
    return ComputeContextManager.manager.get(handle);
  }

  /**
   * 创建或替换计算时上下文
   * @param handle 唯一键
   * @param parent 父上下文
   */
  public static createOrReplace(handle: string, parent?: ComputeContext): ComputeContext {
    return ComputeContextManager.manager.createOrReplace(handle, parent);
  }

  public static delete(handle: string, deep = true) {
    ComputeContextManager.manager.delete(handle, deep);
  }
}

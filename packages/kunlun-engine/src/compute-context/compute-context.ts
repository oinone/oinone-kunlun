import { ExpressionRunParam } from '@oinone/kunlun-expression';
import { ContextNode } from '@oinone/kunlun-shared';
import { RuntimeContext } from '../runtime-context';
import { RuntimeModelField } from '../runtime-metadata';
import { Node, ReactiveEffectRunner } from './ast';

/**
 * 计算上下文
 */
export interface ComputeContext extends ContextNode<ComputeContext> {
  /**
   * 运行时上下文
   */
  runtimeContext: RuntimeContext;

  /**
   * 依赖树
   */
  deps?: Deps;

  /**
   * 响应影响运行器
   */
  runner: ReactiveEffectRunner;

  /**
   * 计算钩子
   */
  computeHook?(dep: Dep, context: ExpressionRunParam): void;

  /**
   * 解析compute属性
   */
  resolveCompute(): void;

  /**
   * 执行计算或指定字段计算
   * 当指定字段时，只会触发受该字段影响的表达式计算
   * @param context 表达式上下文参数
   * @param fields 指定字段
   */
  compute(context: ExpressionRunParam, fields?: RuntimeModelField | RuntimeModelField[]): void;
}

export interface Dep {
  computeContext: ComputeContext;

  deps: Deps;

  field: RuntimeModelField;

  defaultValueNode?: Node;

  computeNode?: Node;

  /**
   * 响应影响运行器
   */
  runner: ReactiveEffectRunner;

  /**
   * 表达式计算
   * @param context
   */
  compute(context: ExpressionRunParam);

  /**
   * 追踪函数
   * @param dep
   * @param context
   */
  track(dep: Dep, context: ExpressionRunParam);
}

export type Deps = Map<string, Dep>;

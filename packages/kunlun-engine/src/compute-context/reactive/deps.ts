import { ExpressionRunParam } from '@kunlun/expression';
import { ObjectUtils } from '@kunlun/shared';
import { RuntimeModelField } from '../../runtime-metadata';
import {
  ASTOptimize,
  ASTOptimizeAdapter,
  ASTOptimizeAdapterOptions,
  ASTVisitorAdapter,
  EffectManager,
  ExpressionExecutor,
  Identifier,
  isIdentifier,
  isMemberExpression,
  MemberExpression,
  Node,
  ReactiveEffect,
  ReactiveEffectRunner,
  TriggerDirective,
  useTriggerDirective
} from '../ast';
import { ComputeContext, Dep, Deps } from '../compute-context';

type DepMethod = Function & { __creator?: boolean };

function createDepMethod(fn: Function, creator?: boolean): DepMethod {
  const depMethod = fn as DepMethod;
  depMethod.__creator = creator;
  return depMethod;
}

/**
 * 运行时上下文内置方法
 */
const depMethods: Record<string, DepMethod> = {
  compute: createDepMethod(createComputeMethod, true),
  track: createDepMethod(createTrackMethod, true)
};

export class DepManager {
  private constructor() {
    // reject create object
  }

  public static createDeps(): Deps {
    return new Map<string, Dep>();
  }

  public static createDep(
    computeContext: ComputeContext,
    field: RuntimeModelField,
    defaultValueNode: Node | undefined,
    computeNode: Node | undefined,
    effect: ReactiveEffect
  ): Dep {
    const dep = {
      computeContext,
      deps: DepManager.createDeps(),
      field,
      defaultValueNode,
      computeNode
    } as Dep;
    const methodKeys: string[] = [];
    Object.entries(depMethods).forEach(([method, fn]) => {
      methodKeys.push(method);
      let finalFn = fn;
      if (fn.__creator) {
        finalFn = fn(dep, effect);
      }
      dep[method] = finalFn.bind(dep);
    });
    dep.runner = createEffectRunner(dep, effect);
    methodKeys.push('runner');
    return ObjectUtils.readonly(dep, methodKeys);
  }

  public static generatorDepKeyByField(field: RuntimeModelField) {
    const { data, __index } = field;
    return `${data}#${__index}`;
  }
}

function createEffectRunner(dep: Dep, effect: ReactiveEffect) {
  let defaultValueNodeOptimize = false;
  let computeNodeOptimize = false;

  function runner(this: Dep, targetDep: Dep, context: ExpressionRunParam) {
    const { defaultValueNode, computeNode } = this;
    if (defaultValueNode && !defaultValueNodeOptimize) {
      defaultValueNodeOptimize = true;
      ASTOptimize.run(defaultValueNode, createDepResolveAdapter(this));
    }
    if (computeNode && !computeNodeOptimize) {
      computeNodeOptimize = true;
      ASTOptimize.run(computeNode, createDepResolveAdapter(this));
    }
    this.compute(context);
  }

  return EffectManager.track(runner.bind(dep), {
    effect,
    lazy: true,
    duplex: false
  });
}

function createComputeMethod() {
  let defaultValueNodeExecute = false;
  return function compute(this: Dep, context: ExpressionRunParam) {
    const { field, defaultValueNode, computeNode } = this;
    const { data } = field;
    if (!data) {
      return;
    }
    // fixme @zbh 20230901 此处取值需要做外接处理
    const target = context?.activeRecord;
    if (!target) {
      return;
    }
    const value = target[data];
    if (defaultValueNode) {
      if (!defaultValueNodeExecute) {
        defaultValueNodeExecute = true;
        const res = ExpressionExecutor.run(context, defaultValueNode, value);
        if (res !== value) {
          // fixme @zbh 20230901 此处回填需要做外接处理
          target[data] = res;
        }
      }
    }
    if (computeNode) {
      const res = ExpressionExecutor.run(context, computeNode, value);
      if (res !== value) {
        // fixme @zbh 20230901 此处回填需要做外接处理
        target[data] = res;
      }
    }
  };
}

function createDepResolveAdapter(dep: Dep): DepResolveAdapter {
  return new DepResolveAdapter({ dep });
}

function createTrackMethod() {
  return function track(this: Dep, dep: Dep, context: ExpressionRunParam) {
    useTriggerDirective(TriggerDirective.FORCE_THIS | TriggerDirective.IGNORED_DEPS, () => {
      this.computeContext.compute(context, this.field);
    });
  };
}

export interface ASTDepOptimizeAdapterOptions extends ASTOptimizeAdapterOptions {
  dep: Dep;
}

export class DepResolveAdapter extends ASTOptimizeAdapter implements ASTVisitorAdapter {
  private dep: Dep;

  public constructor(options: ASTDepOptimizeAdapterOptions) {
    super(options);
    this.dep = options.dep;
  }

  protected findIdentifierByMemberExpression(node: MemberExpression): Identifier | undefined {
    const { dep } = this;
    if (dep) {
      return this.findIdentifierByMemberExpressionAndTrack(dep, node, true).identifier;
    }
    return super.findIdentifierByMemberExpression(node);
  }

  protected findIdentifierByMemberExpressionAndTrack(
    dep: Dep,
    node: MemberExpression,
    track: boolean
  ): { identifier: Identifier | undefined; stack?: Dep[] } {
    const { object, property } = node;
    if (isIdentifier(object)) {
      const { value } = object;
      let stack: Dep[] | undefined;
      if ((this.tokenProperties.length || this.tokenProperties.includes(value)) && isIdentifier(property)) {
        const trackModelField = this.findTrackModelField(dep, property.value);
        if (trackModelField) {
          if (track) {
            this.createTrackByField(dep, trackModelField);
          } else {
            stack = [];
            this.pushStack(stack, dep, trackModelField);
          }
        }
      }
      return {
        identifier: object,
        stack
      };
    }
    if (isMemberExpression(object)) {
      const res = this.findIdentifierByMemberExpressionAndTrack(dep, object, false);
      const { stack } = res;
      if (track && isIdentifier(property)) {
        let lastOriginDep = dep;
        let lastTargetDep = dep;
        stack?.forEach((item) => {
          lastTargetDep = item;
          this.createTrack(lastOriginDep.runner.effect, lastTargetDep);
          lastOriginDep = item;
        });
      }
      return res;
    }
    return { identifier: undefined };
  }

  protected findTrackModelField(dep: Dep, data: string): RuntimeModelField | undefined {
    const targetField = dep.computeContext.runtimeContext.getModelField(data);
    if (targetField) {
      const { modelField, isOther } = targetField;
      if (!isOther) {
        return modelField;
      }
    }
    return undefined;
  }

  protected getTrackDep(dep: Dep, field: RuntimeModelField) {
    return dep.computeContext.deps?.get(DepManager.generatorDepKeyByField(field));
  }

  protected pushStack(stack: Dep[], dep: Dep, field: RuntimeModelField) {
    let target = this.getTrackDep(dep, field);
    if (!target) {
      target = this.createDep(dep, field);
    }
    stack.splice(0, 0, target);
  }

  protected createTrackByField(
    origin: Dep,
    field: RuntimeModelField
  ): { track: Dep; runner: ReactiveEffectRunner } | undefined {
    let target = this.getTrackDep(origin, field);
    if (!target) {
      target = this.createDep(origin, field);
    }
    return {
      track: target,
      runner: this.createTrack(target.runner.effect, origin)
    };
  }

  protected createDep(origin: Dep, field: RuntimeModelField): Dep {
    const { computeContext } = origin;
    let { deps } = computeContext;
    if (!deps) {
      deps = DepManager.createDeps();
      computeContext.deps = deps;
    }
    const key = DepManager.generatorDepKeyByField(field);
    const target = DepManager.createDep(
      computeContext,
      field,
      undefined,
      undefined,
      origin.computeContext.runner.effect
    );
    deps.set(key, target);
    return target;
  }

  protected createTrack(effect: ReactiveEffect, target: Dep) {
    return EffectManager.track(target.track, {
      effect,
      lazy: true,
      duplex: false
    });
  }
}

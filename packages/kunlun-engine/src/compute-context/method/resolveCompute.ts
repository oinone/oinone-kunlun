import { ExpressionRunParam } from '@oinone/kunlun-expression';
import { isString } from 'lodash-es';
import { RuntimeModelField } from '../../runtime-metadata';
import { EffectManager, ExpressionExecutor, Node, ReactiveEffect, ReactiveEffectRunner } from '../ast';
import { ComputeContext, Dep } from '../compute-context';
import { DepManager } from '../reactive';

export default function resolveCompute(this: ComputeContext): void {
  if (this.deps) {
    return;
  }
  this.deps = DepManager.createDeps();
  const fields = this.runtimeContext.model.modelFields;
  let runner: ReactiveEffectRunner;
  const { computeHook } = this;
  if (computeHook) {
    runner = EffectManager.createEffect((dep: Dep, context: ExpressionRunParam) => {
      computeHook(dep, context);
    });
  } else {
    runner = EffectManager.createEffect(undefined);
  }
  this.runner = runner;
  const resolve = resolveExpression.bind(this);
  for (const field of fields) {
    resolve(field, runner.effect);
  }
}

function resolveExpression(this: ComputeContext, field: RuntimeModelField, effect: ReactiveEffect) {
  const { defaultValue, compute } = field;
  let defaultValueNode: Node | undefined;
  if (defaultValue && isString(defaultValue)) {
    try {
      defaultValueNode = ExpressionExecutor.parser(defaultValue);
    } catch (e) {
      console.error(e);
    }
  }
  let computeNode: Node | undefined;
  if (compute && isString(compute)) {
    try {
      computeNode = ExpressionExecutor.parser(compute);
    } catch (e) {
      console.error(e);
    }
  }
  if (defaultValueNode || computeNode) {
    if (!this.deps) {
      this.deps = DepManager.createDeps();
    }
    const key = DepManager.generatorDepKeyByField(field);
    if (!this.deps.has(key)) {
      this.deps.set(key, DepManager.createDep(this, field, defaultValueNode, computeNode, effect));
    }
  }
}

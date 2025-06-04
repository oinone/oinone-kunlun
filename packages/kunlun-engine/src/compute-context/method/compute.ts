import { ExpressionRunParam } from '@oinone/kunlun-expression';
import { ObjectUtils } from '@oinone/kunlun-shared';
import { RuntimeModelField } from '../../runtime-metadata';
import { EffectManager, isUsingTriggerDirective, TriggerDirective } from '../ast';
import { ComputeContext } from '../compute-context';
import { DepManager } from '../reactive';

export default function compute(
  this: ComputeContext,
  context: ExpressionRunParam,
  fields?: RuntimeModelField | RuntimeModelField[]
) {
  if (!this.deps) {
    console.error('Invalid deps. please using resolve compute method generate deps.');
    return;
  }
  if (!fields) {
    Array.from(this.deps.values()).forEach((dep) => {
      EffectManager.trigger(dep.runner.effect, dep, context);
    });
    return;
  }
  let finalFields: RuntimeModelField[];
  if (Array.isArray(fields)) {
    finalFields = fields;
  } else {
    finalFields = [fields];
  }
  finalFields
    .map((field) => DepManager.generatorDepKeyByField(field))
    .map((key) => this.deps!.get(key))
    .filter(ObjectUtils.isNotNull)
    .forEach((v) => {
      if (isUsingTriggerDirective(TriggerDirective.FORCE_THIS)) {
        EffectManager.trigger(v.runner.effect, v, context);
      } else {
        EffectManager.triggerWithDirective(v.runner.effect, TriggerDirective.IGNORED_THIS, v, context);
      }
    });
}

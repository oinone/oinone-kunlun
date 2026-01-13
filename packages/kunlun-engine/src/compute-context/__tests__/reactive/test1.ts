import { ASTOptimize, EffectManager, ExpressionExecutor } from '../../ast';
import { data, parameters } from '../data';

const expression = 'activeRecord.name + "bbb"';

let node = ExpressionExecutor.parser(expression)!;

function expressionRunner() {
  console.log(ExpressionExecutor.run(parameters, node));
}

function createTrackRunner() {
  let isOptimize = false;
  return () => {
    if (!isOptimize) {
      ASTOptimize.run(node);
      isOptimize = true;
      return;
    }
    expressionRunner();
  };
}

const runner = EffectManager.track(createTrackRunner());

EffectManager.trigger(runner.effect);

// data.name = 'ccc';
data.field0004 = true;

EffectManager.trigger(runner.effect);

// console.log(ExpressionExecutor.run(parameters, node));

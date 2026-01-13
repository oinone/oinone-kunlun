import { ExpressionExecutor } from '../../ast';
import { model1 } from '../data';

// const expression = "activeRecord.code + '#' + ADD(activeRecord.model2.model3.code, activeRecord.code)";
// const expression = "IF(activeRecord.code, activeRecord.name) + '#' + activeRecord.code";

// const expression = 'activeRecord.model2.code && (activeRecord.model2.name || activeRecord.code)';
// const expression = 'ABS(activeRecord.code) + CEIL(activeRecord.code)';
let expression = '`ccc${activeRecord.name + "ddd"}bbb` + activeRecord.name + "bbb"';
console.log(expression);
const node = ExpressionExecutor.parser(expression);
if (node) {
  const s = ExpressionExecutor.toString(node);
  console.log(s);
  const node2 = ExpressionExecutor.parser(s);
  console.log('node', node);
  console.log('node2', node2);
}

console.log(ExpressionExecutor.translate(expression, { model: model1 }));

import { ASTOptimize, ASTOptimizeAdapter, ExpressionExecutor } from '../../ast';
import { parameters } from '../data';
import expression from './expression';
import { Expression } from '@oinone/kunlun-expression';

console.log('-----------------------------------test2-----------------------------------');

// const expression = '-activeRecord.field0003 * -5';
// const expression = 'activeRecord.field0005 * -5';
// const expression = 'activeRecord.field0003 + 1 / activeRecord.field0006 + 2 / activeRecord.field0006 + 3';
// const expression = "(1 + 2 == 3) && activeRecord.name == 'aaa'";
// const expression = "(1 + 2 == 3) && activeRecord.name == 'aaa' && !(1 + 3 == 3)";
// const expression = '1 + activeRecord.field0003 * 3 - 2 - activeRecord.field0006 - 5 - activeRecord.field0006 + 7';
console.log(expression);

const node = ExpressionExecutor.parser(expression);
if (node) {
  console.log('old expression', Expression.run(parameters, expression));
  console.log('optimize before', ExpressionExecutor.run(parameters, node), JSON.parse(JSON.stringify(node)));
  ASTOptimize.run(
    node,
    new ASTOptimizeAdapter({ context: parameters as unknown as Record<string, unknown>, simplify: false })
  );
  const s = ExpressionExecutor.toString(node);
  console.log(s, node);
  console.log('eval', eval(s));
  console.log('optimize after', ExpressionExecutor.run(parameters, node));
}

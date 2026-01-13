import { ASTOptimize, ExpressionExecutor } from '../../ast';
import { parameters } from '../data';
import expression from './expression';
import { Expression } from '@oinone/kunlun-expression';

console.log('-----------------------------------test1-----------------------------------');

// const expression = '1 == 2 ?  + \'code\' : "ccc"';
// const expression = "activeRecord.name == 'aaa' && !(1 + 3 == 3)";
// const expression = "activeRecord.name == 'aaa' && 1 + 3 != 3";
// const expression = "(1 + 2 == 3) && activeRecord.name == 'aaa'";
// const expression = "(1 + 2 == 3) && activeRecord.name == 'aaa' && !(1 + 3 == 3)";
// const expression = 'activeRecord.name == null';
// const expression = 'activeRecord.code == null';
// const expression = '1 + 2 + activeRecord.field0003';
// const expression = '1 + activeRecord.field0003 + 2';
// const expression = '1 + activeRecord.field0003 / 2 * 2';
// const expression = '1 - 1 + activeRecord.field0003 / 3 * 3';
// const expression = 'activeRecord.field0005 / 3 * 3';
// const expression = 'activeRecord.field0003 / activeRecord.field0006 / activeRecord.field0006';
// console.log(`100 / 5 / 5 = ${100 / 5 / 5}`);
// const expression = 'activeRecord.field0003 / 4 % 5';
// const expression = 'activeRecord.field0003 / 2 >> 1';
// const expression = 'activeRecord.field0003 >> 1 / 2';
// const expression = '1 - 1 + activeRecord.field0003 / 2 * 5';
// const expression = '1 - 1 + activeRecord.field0003 / 2 + 3';
// const expression = 'activeRecord.field0003 / 5 / 5';
// const expression = 'activeRecord.field0003 / 5 * 5';
// const expression = '1 + activeRecord.field0003 - 3 + 2';
// const expression = 'activeRecord.field0003 - 3 - 2';
// const expression = 'activeRecord.field0003 - (3 - 4)';
// const expression = 'activeRecord.field0003 * -3';
// const expression = 'activeRecord.field0003 * -1';
// const expression = '-activeRecord.field0003 * -5';
// const expression = '1 + activeRecord.field0003 * 3 + 2 - activeRecord.field0006 + 5';
// const expression = '1 + activeRecord.field0003 * 3 - 2 - activeRecord.field0006 - 5';
// const expression = '1 + activeRecord.field0003 * 3 - 2 - activeRecord.field0006 - 5 - activeRecord.field0006 + 7';
console.log(expression);

const node = ExpressionExecutor.parser(expression);
if (node) {
  console.log('old expression', Expression.run(parameters, expression));
  console.log('optimize before', ExpressionExecutor.run(parameters, node), JSON.parse(JSON.stringify(node)));
  ASTOptimize.run(node);
  console.log(ExpressionExecutor.toString(node), node);
  console.log('optimize after', ExpressionExecutor.run(parameters, node));
}

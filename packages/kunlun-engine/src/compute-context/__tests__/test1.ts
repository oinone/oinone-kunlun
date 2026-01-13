import { ComputeExpressionService } from '../spi';
import { parameters } from './data';
import { DefaultExpressionExecutorService, Expression } from '@oinone/kunlun-expression';

// console.log(Expression.run(parameters, 'activeRecord.name + "bbb"', 'error'));
//
// console.log(ExpressionExecutor.run(parameters, 'activeRecord.name + "bbb"'));
//
// console.log(ExpressionExecutor.run(parameters, '`${activeRecord.name}bbb` + activeRecord.name + "bbb"'));
//
// console.log(ExpressionExecutor.run(parameters, '`ccc${activeRecord.name + "ddd"}bbb` + activeRecord.name + "bbb"'));

// console.log(Expression.run(parameters, 'LIST_GET(activeRecords, 0).name + "bbb"', 'error'));

// console.log(Expression.run(parameters, 'activeRecord.name.a + "bbb"', 'error'));

// console.log(Expression.run(parameters, 'activeRecord.name + "_demo"', 'error'));
// console.log(Expression.run(parameters, 'JOIN(activeRecord.name, "_demo")', 'error'));

// console.log(Expression.run(parameters, '"1" + "2"', 'error'));
// console.log(Expression.run(parameters, 'JOIN("1", "2")', 'error'));

// console.log(Expression.run(parameters, 'activeRecord.contactAddress#originCountry.code', 'error'));

run('activeRecord.contactAddress#originCountry.code');

// let expression = 'ADD(TO_NUMBER(TRIM("123   ")), TO_NUMBER(TRIM("  456  ")))';
// let expression = '" s ".trim()';

// run('TRIM("   abc \'\t\\"cc  ")');
// run("TRIM('   abc \\'\t\"cc  ')");
// run('确认要执行动作吗');
// run('注意：在选择完年、月、日后，请在元素之间手动输入分隔符（如‘-’、‘/’等）以完成日期格式。');
// run('source != BUILT_IN');

function run(expression: string) {
  console.log(new DefaultExpressionExecutorService().run(parameters, expression, 'error'));
  console.log(new ComputeExpressionService().run(parameters, expression, 'error'));
  console.log(Expression.run(parameters, expression, 'error'));
}

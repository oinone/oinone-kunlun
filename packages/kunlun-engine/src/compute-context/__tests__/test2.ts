import { ASTOptimize, ASTOptimizeAdapter, ExpressionExecutor } from '../ast';
import { parameters } from './data';

let expression = '`ccc${activeRecord.name + "ddd"}bbb` + activeRecord.name + "bbb"';
console.log(expression);
console.log(ExpressionExecutor.toString(ExpressionExecutor.parser(expression)!));

expression = '`ccc${activeRecord.b.name + "ddd"}bbb` + d.activeRecord.name + "bbb"';
console.log(expression);
let node = ExpressionExecutor.parser(expression)!;
ASTOptimize.run(node);
console.log(ExpressionExecutor.toString(node));
console.log(ExpressionExecutor.run(parameters, node));

console.log(expression);
node = ExpressionExecutor.parser(expression)!;
ASTOptimize.run(node, new ASTOptimizeAdapter());
console.log(ExpressionExecutor.toString(node));
console.log(ExpressionExecutor.run(parameters, node));

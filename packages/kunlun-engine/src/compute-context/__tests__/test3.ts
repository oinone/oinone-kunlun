import { ASTOptimize, ExpressionExecutor } from '../ast';
import { parameters } from './data';
import { Expression } from '@oinone/kunlun-expression';
import { padEnd } from 'lodash-es';

let counter = 0;

function print(name: string, ...args) {
  console.log(padEnd(`${name}:`, 30), ...args);
}

function test(expression: string) {
  console.log(`-----------------------------------test${++counter}-----------------------------------`);
  print('origin', expression);
  print('old executor', Expression.run(parameters, expression, 'error'));
  let node = ExpressionExecutor.parser(expression)!;
  ASTOptimize.run(node);
  print('optimize', ExpressionExecutor.toString(node));
  print('new executor', ExpressionExecutor.run(parameters, node));
}

test('中文测试1 + activeRecord.name + 中文测试2');
test('中文测试1');

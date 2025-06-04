import {
  ExpressionExecutorService,
  ExpressionExecutorServiceToken,
  ExpressionRunParam
} from '@oinone/kunlun-expression';
import { SPI } from '@oinone/kunlun-spi';
import { isEmpty, isString } from 'lodash-es';
import { ExpressionExecutor } from '../ast';

@SPI.Service(ExpressionExecutorServiceToken, { name: 'compute', priority: 100 })
export class ComputeExpressionService implements ExpressionExecutorService {
  public run<T>(param: ExpressionRunParam, expression: string, errorValue?: T): T | string | undefined {
    if (!isString(expression) || isEmpty(expression)) {
      return expression;
    }
    const activeRecord = !param.activeRecord ? param.activeRecords[0] || {} : param.activeRecord;
    param.activeRecord = activeRecord;
    try {
      return ExpressionExecutor.run(param, expression, errorValue) as unknown as T;
    } catch (e) {
      console.error(`无法解析表达式: ${expression}`);
      return errorValue;
    }
  }
}

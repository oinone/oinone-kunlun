import { type ExpressionExecutorService, ExpressionExecutorServiceToken, type ExpressionRunParam } from '@oinone/kunlun-expression';
import { SPI } from '@oinone/kunlun-spi';
import { isEmpty, isString } from 'lodash-es';
import { ExpressionExecutor } from '../ast';

@SPI.Service(ExpressionExecutorServiceToken, { name: 'compute', priority: 100 })
export class ComputeExpressionService implements ExpressionExecutorService {
  public run<T>(param: ExpressionRunParam, expression: string, errorValue?: T): T | string | undefined {
    if (!isString(expression) || isEmpty(expression)) {
      return expression;
    }
    let activeRecord: Record<string, unknown>;
    if (param.activeRecord) {
      activeRecord = param.activeRecord;
    } else {
      activeRecord = param.activeRecords?.[0] || {};
    }
    param = {
      ...param,
      activeRecord
    };
    try {
      return ExpressionExecutor.run(param, expression, errorValue) as unknown as T;
    } catch (e) {
      console.error(`Unable to parse expression: ${expression}`);
      return errorValue;
    }
  }
}

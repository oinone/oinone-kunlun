import { SPI } from '@kunlun/spi';
import { isEmpty, isString } from 'lodash-es';
import { Expression } from '../Expression';
import { ExpressionRunParam } from '../ExpressionDefinition';
import { ExpressionExecutorService, ExpressionExecutorServiceToken } from './ExpressionExecutorService';

@SPI.Service(ExpressionExecutorServiceToken, { name: '__default__', priority: 0 })
export class DefaultExpressionExecutorService implements ExpressionExecutorService {
  public run<T>(param: ExpressionRunParam, expression: string, errorValue?: T): T | string | undefined {
    if (!isString(expression) || isEmpty(expression)) {
      return expression;
    }
    Expression.getInstance().initExpressionContext(
      param.activeRecords,
      param.rootRecord,
      param.openerRecord,
      param.scene,
      param.activeRecord,
      param.parentRecord
    );
    try {
      return Expression.getInstance().exec(expression) as T;
    } catch (e) {
      console.error(`无法解析表达式: ${expression}`);
      return errorValue;
    } finally {
      Expression.getInstance().cleanupExpressionContext();
    }
    return expression;
  }
}

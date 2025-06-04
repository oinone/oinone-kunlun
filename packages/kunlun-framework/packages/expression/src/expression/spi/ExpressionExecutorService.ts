import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { ExpressionRunParam } from '../ExpressionDefinition';

/**
 * 表达式执行服务
 */
export interface ExpressionExecutorService {
  run<T>(param: ExpressionRunParam, expression: string, errorValue?: T): T | string | undefined;
}

/**
 * ExpressionExecutorService Token
 */
export const ExpressionExecutorServiceToken = ServiceIdentifier<ExpressionExecutorService>('ExpressionExecutorService');

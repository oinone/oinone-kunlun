import { ModelFieldType } from '@kunlun/meta';
import { RuntimeModel } from './base';

export const FunctionSelfFlag = '__self__';

export type FunctionSelfFlagType = '__self__';

export enum FunctionType {
  CREATE = 'CREATE',
  DELETE = 'DELETE',
  UPDATE = 'UPDATE',
  QUERY = 'QUERY'
}

export interface RuntimeFunctionDefinition {
  /**
   * 函数类型
   */
  type: FunctionType[];
  /**
   * 函数命名空间
   */
  namespace: string | FunctionSelfFlagType;
  /**
   * 函数编码
   */
  fun?: string;
  /**
   * API名称
   */
  name: string;
  /**
   * 参数列表
   */
  argumentList: RuntimeFunctionArgument[];
  /**
   * 返回类型
   */
  returnType?: RuntimeFunctionReturnType;
}

export interface RuntimeFunctionArgument {
  name: string;
  ttype: ModelFieldType | FunctionSelfFlagType;
  multi?: boolean;
  model?: string;
  modelDefinition?: RuntimeModel;
}

export interface RuntimeFunctionReturnType {
  ttype: ModelFieldType | FunctionSelfFlagType;
  multi?: boolean;
  model?: string;
  modelDefinition?: RuntimeModel;
}

export function isQueryFunction(type: FunctionType | FunctionType[]) {
  if (Array.isArray(type)) {
    return type.includes(FunctionType.QUERY);
  }
  return type === FunctionType.QUERY;
}

export function isMutationFunction(type: FunctionType | FunctionType[]) {
  if (Array.isArray(type)) {
    if (!type.length) {
      return false;
    }
    return !type.includes(FunctionType.QUERY);
  }
  return [FunctionType.CREATE, FunctionType.UPDATE, FunctionType.DELETE].includes(type);
}

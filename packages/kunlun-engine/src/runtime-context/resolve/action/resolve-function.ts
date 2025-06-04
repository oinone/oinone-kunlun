import { ModelFieldType } from '@oinone/kunlun-meta';
import { FunctionType, RuntimeFunctionDefinition } from '../../../runtime-metadata';

export interface DslFunction {
  type: FunctionType[];
  namespace: string;
  fun: string;
  name: string;
  argumentList: DslFunctionArgument[];
  returnType?: DslFunctionReturnType;
}

export interface DslFunctionReturnType {
  ttype: ModelFieldType;
  multi: boolean;
  model: string;
}

export interface DslFunctionArgument {
  name: string;
  ttype: ModelFieldType;
  multi: boolean;
  model: string;
}

export function convertFunction(model: string, dslFunction: DslFunction): RuntimeFunctionDefinition {
  const functionDefinition: RuntimeFunctionDefinition = {
    type: dslFunction.type,
    namespace: dslFunction.namespace || model,
    fun: dslFunction.fun,
    name: dslFunction.name,
    argumentList:
      dslFunction.argumentList?.map((v) => {
        return {
          name: v.name,
          ttype: v.ttype,
          multi: v.multi,
          model: v.model || model
        };
      }) || []
  };
  const returnType = dslFunction?.returnType;
  if (returnType) {
    functionDefinition.returnType = {
      ttype: returnType.ttype,
      multi: returnType.multi,
      model: returnType.model || model
    };
  }
  return functionDefinition;
}

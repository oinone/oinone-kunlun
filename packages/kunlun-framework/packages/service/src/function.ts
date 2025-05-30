import { IModelField, IModelFunc } from '@kunlun/meta';

export function executeFunction(
  namespace: string,
  fun: string,
  responseFields: IModelField[] | undefined,
  ...args: { value: unknown; requestFields?: IModelField[] | undefined }[]
) {}

export function executeFunctionByFunctionDefinition(
  functionDefinition: IModelFunc,
  responseFields: IModelField[] | undefined,
  ...args: { value: unknown; requestFields?: IModelField[] | undefined }[]
) {}

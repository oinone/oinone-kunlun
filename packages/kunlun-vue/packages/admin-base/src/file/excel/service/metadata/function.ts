import { FunctionType, RuntimeFunctionDefinition } from '@oinone/kunlun-engine';
import { ModelFieldType } from '@oinone/kunlun-meta';
import { StaticFileMetadata } from './model';

export namespace StaticFileFunction {
  export const CREATE_EXPORT_TASK_NAME = 'createExportTask';

  export const createExportTask: RuntimeFunctionDefinition = {
    type: [FunctionType.CREATE],
    namespace: StaticFileMetadata.ExcelExportTaskModel,
    name: CREATE_EXPORT_TASK_NAME,
    fun: CREATE_EXPORT_TASK_NAME,
    argumentList: [
      {
        name: 'data',
        ttype: ModelFieldType.ManyToOne,
        model: StaticFileMetadata.ExcelExportTaskModel,
        modelDefinition: StaticFileMetadata.ExcelExportTask
      }
    ],
    returnType: {
      ttype: ModelFieldType.ManyToOne,
      model: StaticFileMetadata.ExcelExportTaskModel,
      modelDefinition: {
        ...StaticFileMetadata.ExcelExportTask,
        modelFields: [StaticFileMetadata.ExcelExportTask.modelFields[0]]
      }
    }
  };
}

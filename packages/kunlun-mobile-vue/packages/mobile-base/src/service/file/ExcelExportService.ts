import { ActiveRecord, FunctionOptions, FunctionService, RuntimeModel, StaticMetadata } from '@oinone/kunlun-engine';
import { Condition } from '@oinone/kunlun-request';
import { ExcelExportTask } from '../../typing';
import { StaticFileFunction, StaticFileMetadata } from './metadata';

export class ExcelExportService {
  public static createExportTask(
    model: RuntimeModel,
    workbookId: string,
    condition: Condition | string,
    options: FunctionOptions
  ) {
    let queryData: ActiveRecord | undefined;
    if (condition instanceof Condition) {
      queryData = condition.getConditionBodyData();
      condition = condition.toString();
    }

    const data: ExcelExportTask = {
      workbookDefinition: {
        id: workbookId
      },
      conditionWrapper: {
        rsql: condition,
        queryData
      }
    };

    return FunctionService.INSTANCE.simpleExecute<ExcelExportTask>(
      model,
      StaticFileFunction.createExportTask,
      {
        ...options,
        requestModels: [
          StaticMetadata.QueryWrapper,
          StaticFileMetadata.ExcelWorkbookDefinition,
          StaticFileMetadata.ExcelExportTask
        ],
        responseModels: [StaticFileMetadata.ExcelExportTask]
      },
      data
    );
  }
}

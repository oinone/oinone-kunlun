import { ActiveRecord, FunctionOptions, GenericFunctionService, RuntimeModel } from '@kunlun/engine';
import { Condition } from '@kunlun/request';
import { ExcelExportTask } from '../typing';
import { StaticFileMetadata } from './metadata';

export class ExcelExportService {
  public static createExportTask(
    model: RuntimeModel,
    workbookId: string,
    condition: Condition | string,
    options: FunctionOptions
  ): Promise<ExcelExportTask | undefined> {
    return ExcelExportService.createExportTaskByTask(
      model,
      {
        workbookDefinition: {
          id: workbookId
        }
      },
      condition,
      options
    );
  }

  public static async createExportTaskByTask(
    model: RuntimeModel,
    task: Partial<ExcelExportTask>,
    condition: Condition | string,
    options?: FunctionOptions
  ): Promise<ExcelExportTask> {
    return ExcelExportService.createExportTask0('createExportTask', model, task, condition, options);
  }

  public static async prepareCreateExportTask(
    model: RuntimeModel,
    task: Partial<ExcelExportTask>,
    condition: Condition | string,
    options?: FunctionOptions
  ) {
    return ExcelExportService.createExportTask0('prepareCreateExportTask', model, task, condition, {
      ...(options || {}),
      responseFields: [{ field: StaticFileMetadata.REQUEST_ID_FIELD }]
    });
  }

  private static async createExportTask0(
    fun: string,
    model: RuntimeModel,
    task: Partial<ExcelExportTask>,
    condition: Condition | string,
    options?: Partial<FunctionOptions>
  ) {
    let queryData: ActiveRecord | undefined;
    if (condition instanceof Condition) {
      queryData = condition.getConditionBodyData();
      condition = condition.toString();
    }

    const data: ExcelExportTask = {
      ...task,
      conditionWrapper: {
        rsql: condition,
        queryData
      }
    };

    if (!options?.requestFields?.length) {
      delete options?.requestFields;
    }

    const result = await GenericFunctionService.INSTANCE.executeByFun<ExcelExportTask>(
      model.model,
      fun,
      {
        deep: 1,
        ...options
      },
      data
    );
    if (!result) {
      throw new Error('创建导出任务失败');
    }
    return result;
    // fixme @zbh 20240805 5.1 using static metadata
    // return FunctionService.INSTANCE.simpleExecute<ExcelExportTask>(
    //   model,
    //   StaticFileFunction.createExportTask,
    //   {
    //     ...options,
    //     requestModels: [
    //       StaticMetadata.QueryWrapper,
    //       StaticFileMetadata.ExcelWorkbookDefinition,
    //       StaticFileMetadata.ExcelExportTask
    //     ],
    //     responseModels: [StaticFileMetadata.ExcelExportTask]
    //   },
    //   data
    // );
  }
}

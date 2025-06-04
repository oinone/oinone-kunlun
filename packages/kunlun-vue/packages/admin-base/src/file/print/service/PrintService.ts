import { ActiveRecord, FunctionOptions, GenericFunctionService, RuntimeModel } from '@oinone/kunlun-engine';
import { Condition } from '@oinone/kunlun-request';
import { PdfPrintTask } from '../typing';

export class PrintService {
  public static createPrintTask(
    model: RuntimeModel,
    documentId: string,
    condition: Condition | string,
    options: FunctionOptions
  ) {
    return PrintService.createPrintTaskByTask(model, { documentDefinitionId: documentId }, condition, options);
  }

  public static async createPrintTaskByTask(
    model: RuntimeModel,
    task: Partial<PdfPrintTask>,
    condition: Condition | string,
    options: FunctionOptions
  ): Promise<PdfPrintTask> {
    let queryData: ActiveRecord | undefined;
    if (condition instanceof Condition) {
      queryData = condition.getConditionBodyData();
      condition = condition.toString();
    }

    const data: PdfPrintTask = {
      ...task,
      conditionWrapper: {
        rsql: condition,
        queryData
      }
    };

    const result = await GenericFunctionService.INSTANCE.executeByFun<PdfPrintTask>(
      model.model,
      'createPrintTask',
      {
        deep: 1
        // ...options
      },
      data
    );
    if (!result) {
      throw new Error('创建打印任务失败');
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

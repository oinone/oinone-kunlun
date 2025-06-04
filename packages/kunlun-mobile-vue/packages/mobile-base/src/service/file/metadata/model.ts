import { MetadataHelper, RuntimeModel, StaticMetadata } from '@oinone/kunlun-engine';
import { ModelFieldType, SYSTEM_MODULE, SYSTEM_MODULE_NAME } from '@oinone/kunlun-meta';

export namespace StaticFileMetadata {
  export const ExcelWorkbookDefinitionModel = '$$excel_workbook_definition_model';

  export const ExcelWorkbookDefinitionModelName = '$$excel_workbook_definition_model';

  export const ExcelWorkbookDefinition: RuntimeModel = {
    model: ExcelWorkbookDefinitionModel,
    name: ExcelWorkbookDefinitionModelName,
    module: SYSTEM_MODULE.FILE,
    moduleName: SYSTEM_MODULE_NAME.FILE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ExcelWorkbookDefinitionModel, ExcelWorkbookDefinitionModelName, {
        data: 'id',
        ttype: ModelFieldType.Long
      })
    ]
  };

  export const ExcelExportTaskModel = '$$export_task_model';

  export const ExcelExportTaskModelName = '$$export_task_model';

  export const ExcelExportTask: RuntimeModel = {
    model: ExcelExportTaskModel,
    name: ExcelExportTaskModelName,
    module: SYSTEM_MODULE.FILE,
    moduleName: SYSTEM_MODULE_NAME.FILE,
    modelActions: [],
    modelFields: [
      MetadataHelper.buildSimpleModelField(ExcelExportTaskModel, ExcelExportTaskModelName, {
        data: 'id',
        ttype: ModelFieldType.Long
      }),
      MetadataHelper.buildSimpleModelField(ExcelExportTaskModel, ExcelExportTaskModelName, {
        data: 'name',
        ttype: ModelFieldType.String
      }),
      MetadataHelper.buildSimpleModelField(ExcelExportTaskModel, ExcelExportTaskModelName, {
        data: 'workbookDefinition',
        ttype: ModelFieldType.ManyToOne,
        references: ExcelWorkbookDefinitionModel,
        referencesModel: ExcelWorkbookDefinition
      }),
      MetadataHelper.buildSimpleModelField(ExcelExportTaskModel, ExcelExportTaskModelName, {
        data: 'conditionWrapper',
        ttype: ModelFieldType.ManyToOne,
        references: StaticMetadata.QueryWrapperModel,
        referencesModel: StaticMetadata.QueryWrapper
      })
    ]
  };
}

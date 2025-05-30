import { IdModel, QueryWrapper } from '@kunlun/engine';
import { IModelField } from '@kunlun/meta';

export type ExcelWorkDefinition = Required<IdModel>;

export interface ExcelExportTask extends IdModel {
  model?: string;
  name?: string;
  workbookDefinition?: ExcelWorkDefinition;
  conditionWrapper?: QueryWrapper;
  exportMethod?: ExcelExportMethodEnum;
  selectedFields?: IModelField[];
  requestId?: string;
  sync?: boolean;
}

export enum ExcelExportMethodEnum {
  /**
   * 根据模板导出
   */
  TEMPLATE = 'TEMPLATE',
  /**
   * 根据模板选择字段导出
   */
  SELECT_TEMPLATE_FIELD = 'SELECT_TEMPLATE_FIELD',
  /**
   * 根据模型选择字段导出
   */
  SELECT_FIELD = 'SELECT_FIELD'
}

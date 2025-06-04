import { IdModel, QueryWrapper } from '@oinone/kunlun-engine';

export type ExcelWorkDefinition = Required<IdModel>;

export interface ExcelExportTask extends IdModel {
  name?: string;
  workbookDefinition?: ExcelWorkDefinition;
  conditionWrapper?: QueryWrapper;
}

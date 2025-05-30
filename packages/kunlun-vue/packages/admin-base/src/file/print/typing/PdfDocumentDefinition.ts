import { IdModel } from '@kunlun/engine';
import { DataStatusEnum } from '@kunlun/meta';

export interface PdfDocumentDefinition extends Required<IdModel> {
  model: string;
  name: string;
  displayName: string;
  filename: string;
  title: string;
  template: string;
  dataStatus: DataStatusEnum;
  sys: boolean;
  groupCode?: string | null;
  module?: string;
  show?: boolean;
}

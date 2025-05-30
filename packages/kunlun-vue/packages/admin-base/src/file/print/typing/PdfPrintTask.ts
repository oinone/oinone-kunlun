import { QueryWrapper } from '@kunlun/engine';

export interface PdfPrintTask {
  model?: string;
  name?: string;
  module?: string;
  documentDefinitionId?: string;
  conditionWrapper?: QueryWrapper;
  sync?: boolean;
  state?: TaskStatus;
  messages?: TaskMessage[];
}

export enum TaskStatus {
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

export interface TaskMessage {
  level: TaskMessageLevel;
  recordDate: string;
  rowIndex: number;
  message: string;
}

export enum TaskMessageLevel {
  TIP = 'TIP',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

import { ActiveRecord, RuntimeAction } from '@oinone/kunlun-engine';
import { CallChaining } from '@oinone/kunlun-shared';

export enum TableEventType {
  /**
   * 添加一行
   */
  add = 'add',
  /**
   * 复制一行
   */
  copy = 'copy',
  /**
   * 编辑一行
   */
  edit = 'edit'
}

export interface BaseTableEvent {
  type: keyof typeof TableEventType | TableEventType;
  action?: RuntimeAction;
}

export interface TableAddEvent extends BaseTableEvent {
  activeRecord?: ActiveRecord;
  activeRecords?: ActiveRecord[];
  insertTo?: number;
}

export interface TableCopyEvent extends BaseTableEvent {
  clone?: boolean;
  activeRecord?: ActiveRecord;
  activeRecords?: ActiveRecord[];
  index?: number;
  copyTo?: number;
}

export interface TableEditEvent extends BaseTableEvent {
  activeRecord?: ActiveRecord;
  activeRecords?: ActiveRecord[];
  index?: number;
}

export type TableEventCallChaining = CallChaining<BaseTableEvent>;

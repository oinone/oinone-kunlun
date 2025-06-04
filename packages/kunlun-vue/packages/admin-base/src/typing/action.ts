import { EventConsumerScope } from '@oinone/kunlun-event';
import { ReturnVoid } from '@oinone/kunlun-shared';

export type ClickResult = ReturnVoid | boolean | Record<string, unknown> | Record<string, unknown>[];

export interface ActionKeyboardConfig extends Record<string, unknown> {
  key: string;
  scope?: EventConsumerScope;
  invisibleDeactivated?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
}

export enum TableRowEditMode {
  CREATE ='CREATE',
  COPY = 'COPY',
  EXIST = 'EXIST'
}

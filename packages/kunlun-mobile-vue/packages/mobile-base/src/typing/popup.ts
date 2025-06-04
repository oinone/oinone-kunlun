import { ActiveRecord, ActiveRecords, RuntimeAction } from '@oinone/kunlun-engine';
import { ClickResult } from './action';

export interface PopupEventHandles {
  cancel: Function;
  ok: Function;
}

export type PopupEventHandle = Record<keyof PopupEventHandles, Function[]>;

export interface PopupSubmitParameters {
  showRecords: ActiveRecord[];
  submitRecords: ActiveRecords;
}

export interface PopupSubmitOptions {
  parameters?: PopupSubmitParameters;
  mapping?: Record<string, unknown>;
  action?: RuntimeAction;
}

export type PopupSubmitFunction = (options?: PopupSubmitOptions) => ClickResult;

export enum PopupSubmitType {
  current = 'current',
  all = 'all'
}

/**
 * PopupType扩展
 * <ul>
 *   <li>dialog: 弹窗 {@link Dialog#type}</li>
 *   <li>drawer: 抽屉 {@link Drawer#type}</li>
 *   <li>inner: 页内路由弹出层</li>
 * </ul>
 */
export enum PopupScene {
  dialog = 'dialog',
  drawer = 'drawer',
  inner = 'inner'
}

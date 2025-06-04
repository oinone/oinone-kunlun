import { ViewActionTarget, ViewType } from '@oinone/kunlun-meta';

/**
 * window.open(URL, name, specs, replace)
 * @see https://www.runoob.com/jsref/met-win-open.html
 * action 通用定义, 函数
 */
export enum RedirectTargetEnum {
  BLANK = '_blank',
  PARENT = '_parent',
  SELF = '_self',
  TOP = '_top'
}

export interface ConfirmOptions {
  zIndex?: number;
  title?: string;
  confirm: string;
  enterText?: string;
  cancelText?: string;
}

export interface ViewActionQueryParameter extends Record<string, string | undefined> {
  module: string;
  viewType: ViewType;
  model: string;
  action: string;
  scene: string;
  target: ViewActionTarget;
  menu?: string;
  language?: string;
  path?: string;
}

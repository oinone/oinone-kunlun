import { isBoolean, isNil } from 'lodash-es';
import { Widget } from '../basic';

type InvisibleGetter = () => boolean;

/**
 * 标记可隐藏功能支持
 */
export interface InvisibleSupported {
  invisible: boolean | InvisibleGetter | undefined;
}

export function executeInvisible(invisibleSupported: InvisibleSupported | undefined): boolean {
  const invisible = invisibleSupported?.invisible;
  if (isNil(invisible)) {
    return false;
  }
  if (isBoolean(invisible)) {
    return invisible;
  }
  return invisible();
}

export function isAllInvisible(widgets: (Widget | InvisibleSupported)[] | undefined): boolean {
  if (!widgets || !widgets.length) {
    return true;
  }
  return widgets.every((widget) => executeInvisible(widget as unknown as InvisibleSupported));
}

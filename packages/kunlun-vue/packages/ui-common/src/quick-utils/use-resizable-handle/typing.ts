import { DEFAULT_PREFIX } from '../../theme';

/**
 * 可拖拽方向
 */
export type Direction = 'horizontal' | 'vertical';

/**
 * 拖拽柄位置
 */
export type HandlePosition = 'top' | 'right' | 'bottom' | 'left';

export type MouseEventFunction = (e: MouseEvent, ...args) => void;

export type HandleEventHandles = {
  onMousedown: MouseEventFunction;
  onClick: MouseEventFunction;
};

export interface ResizableOptions {
  direction: Direction;
  handlePositions: HandlePosition[];
  eventHandles: HandleEventHandles;
}

export const BASE_CLASS_NAME = `${DEFAULT_PREFIX}-resizable`;

export const TARGET_CLASS_NAME = `${BASE_CLASS_NAME}-hosted`;

export const HANDLE_DRAGGING_CLASS_NAME = `${BASE_CLASS_NAME}-handle-dragging`;

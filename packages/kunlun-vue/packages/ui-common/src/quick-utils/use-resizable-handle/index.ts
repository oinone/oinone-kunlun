import { emitEvent, Optional } from '@oinone/kunlun-shared';
import { onBeforeUnmount, onMounted, unref, watchEffect } from 'vue';
import { UnrefType } from '../../typing';
import { CleanableEvent, useCleanableEvent } from '../use-cleanable-event';
import {
  Direction,
  HANDLE_DRAGGING_CLASS_NAME,
  HandleEventHandles,
  HandlePosition,
  ResizableOptions,
  TARGET_CLASS_NAME
} from './typing';
import { closeResizable, generatorHandleClassName, openResizable } from './util';

type onChangeFunction = (
  el: HTMLElement,
  parameters: {
    /**
     * 起始坐标X
     */
    startX: number;
    /**
     * 起始坐标Y
     */
    startY: number;
    /**
     * 变更后的新宽度（当宽度发生变化时有值）
     */
    width?: string;
    /**
     * 变更后的新高度（当高度发生变化时有值）
     */
    height?: string;
  }
) => void;

interface MoveStore {
  handleEl?: HTMLElement;
  isVertical: boolean;
  isReverse: boolean;
  width: number;
  height: number;
  startX: number;
  startY: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  onChange?: onChangeFunction;
}

function convertOptions(
  directionValue: Direction | HandlePosition,
  eventHandles: HandleEventHandles
): ResizableOptions {
  switch (directionValue) {
    case 'horizontal':
      return {
        direction: 'horizontal',
        handlePositions: ['left', 'right'],
        eventHandles
      };
    case 'vertical':
      return {
        direction: 'vertical',
        handlePositions: ['top', 'bottom'],
        eventHandles
      };
    case 'top':
    case 'bottom':
      return {
        direction: 'vertical',
        handlePositions: [directionValue],
        eventHandles
      };
    case 'left':
    case 'right':
      return {
        direction: 'horizontal',
        handlePositions: [directionValue],
        eventHandles
      };
    default:
      throw new Error('Invalid direction value');
  }
}

/**
 * 可选项
 */
export interface ResizableHandleOptions {
  /**
   * 最小宽度
   */
  minWidth?: number;
  /**
   * 最大宽度
   */
  maxWidth?: number;
  /**
   * 最小高度
   */
  minHeight?: number;
  /**
   * 最大高度
   */
  maxHeight?: number;
  /**
   * 当尺寸发生变化时调用
   * @param el 目标HTML元素
   * @param size 当前尺寸，未发生变化的值为空
   */
  onChange?: onChangeFunction;
}

export function useResizableHandle(
  targetRef: UnrefType<HTMLElement | undefined>,
  resizable: UnrefType<boolean>,
  direction?: UnrefType<Direction | HandlePosition | null | undefined>,
  options?: UnrefType<ResizableHandleOptions>
) {
  let moveStore: MoveStore | undefined;
  let moveEvent: CleanableEvent | undefined;
  let stopEvent: CleanableEvent | undefined;

  const removeEvents = () => {
    moveStore?.handleEl?.classList.remove(HANDLE_DRAGGING_CLASS_NAME);
    moveStore = undefined;
    moveEvent?.remove();
    stopEvent?.remove();
  };

  const updateSize = (e: MouseEvent) => {
    const el = unref(targetRef);
    if (!el || !moveStore) {
      return;
    }
    const { isVertical, isReverse, width, height, startX, startY, minWidth, maxWidth, minHeight, maxHeight, onChange } =
      moveStore;
    if (isVertical) {
      const offset = startX - e.pageX;
      let w: number;
      if (isReverse) {
        w = width - offset;
      } else {
        w = width + offset;
      }
      w = Math.max(w, minWidth);
      w = Math.min(w, maxWidth);
      const newWidth = `${w}px`;
      el.style.minWidth = newWidth;
      el.style.maxWidth = newWidth;
      if (onChange) {
        emitEvent(onChange)(el, {
          startX,
          startY,
          width: newWidth
        });
      }
    } else {
      const offset = startY - e.pageY;
      let h: number;
      if (isReverse) {
        h = height - offset;
      } else {
        h = height + offset;
      }
      h = Math.max(h, minHeight);
      h = Math.min(h, maxHeight);
      const newHeight = `${h}px`;
      el.style.minHeight = newHeight;
      el.style.maxHeight = newHeight;
      if (onChange) {
        emitEvent(onChange)(el, {
          startX,
          startY,
          height: newHeight
        });
      }
    }
  };

  const dragStart = (e: MouseEvent) => {
    removeEvents();
    const handleEl = e.target as HTMLElement;
    handleEl.classList.add(HANDLE_DRAGGING_CLASS_NAME);
    const isVertical = handleEl.classList.contains(generatorHandleClassName('vertical'));
    let isReverse: boolean;
    if (isVertical) {
      isReverse = handleEl.classList.contains(`${generatorHandleClassName('vertical')}-right`);
    } else {
      isReverse = handleEl.classList.contains(`${generatorHandleClassName('horizontal')}-bottom`);
    }
    const { width, height } = unref(targetRef)!.getBoundingClientRect();
    const startX = e.pageX;
    const startY = e.pageY;
    const currentOptions = unref(options);
    const minWidth = Optional.ofNullable(currentOptions?.minWidth).orElse(0)!;
    const maxWidth = Optional.ofNullable(currentOptions?.maxWidth).orElse(Infinity)!;
    const minHeight = Optional.ofNullable(currentOptions?.minHeight).orElse(0)!;
    const maxHeight = Optional.ofNullable(currentOptions?.maxHeight).orElse(Infinity)!;
    moveStore = {
      handleEl,
      isVertical,
      isReverse,
      width,
      height,
      startX,
      startY,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      onChange: currentOptions?.onChange
    };
    moveEvent = useCleanableEvent(document.documentElement, 'mousemove', onMousemove);
    stopEvent = useCleanableEvent(document.documentElement, 'mouseup', onMouseup);
  };

  const onMousedown = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragStart(e);
  };

  const onMousemove = (e: MouseEvent) => {
    updateSize(e);
  };

  const onMouseup = (e: MouseEvent) => {
    updateSize(e);
    removeEvents();
  };

  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const onResizeable = () => {
    const el = unref(targetRef);
    if (!el) {
      return;
    }
    const { classList } = el;
    classList.add(TARGET_CLASS_NAME);
    const directionValue = unref(direction);
    const eventHandles: HandleEventHandles = {
      onMousedown,
      onClick
    };
    if (directionValue == null) {
      openResizable(el, convertOptions('horizontal', eventHandles));
      openResizable(el, convertOptions('vertical', eventHandles));
    } else {
      openResizable(el, convertOptions(directionValue, eventHandles));
    }
  };

  const offResizeable = () => {
    const el = unref(targetRef);
    if (!el) {
      return;
    }
    closeResizable(el);
  };

  onMounted(() => {
    watchEffect(() => {
      if (unref(resizable)) {
        onResizeable();
      } else {
        offResizeable();
      }
    });
  });

  onBeforeUnmount(() => {
    offResizeable();
  });
}

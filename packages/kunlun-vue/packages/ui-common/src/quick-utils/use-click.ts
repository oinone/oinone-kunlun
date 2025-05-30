type PointEventFunction = (e: PointerEvent, ...args) => void;

const DEFAULT_MAX_OFFSET_X = 3;
const DEFAULT_MAX_OFFSET_Y = 3;

export function useClick(
  click: PointEventFunction,
  options?: {
    maxOffsetX?: number;
    maxOffsetY?: number;
    mousedownCallback?: PointEventFunction;
    mouseupCallback?: PointEventFunction;
  }
) {
  let mousedownActive = false;

  let pointRecord: { x: number; y: number } | undefined;

  let maxOffsetX = options?.maxOffsetX || 0;
  if (maxOffsetX == null || maxOffsetX <= 0) {
    maxOffsetX = DEFAULT_MAX_OFFSET_X;
  }

  let maxOffsetY = options?.maxOffsetY || 0;
  if (maxOffsetY == null || maxOffsetY <= 0) {
    maxOffsetY = DEFAULT_MAX_OFFSET_Y;
  }

  const onMousedown = (e: PointerEvent, ...args) => {
    mousedownActive = true;
    pointRecord = {
      x: e.clientX,
      y: e.clientY
    };
    options?.mousedownCallback?.(e, ...args);
  };

  const onMouseup = (e: PointerEvent, ...args) => {
    if (mousedownActive && pointRecord) {
      const offsetX = Math.abs(e.clientX - pointRecord.x);
      const offsetY = Math.abs(e.clientY - pointRecord.y);
      if (offsetX <= maxOffsetX && offsetY <= maxOffsetY) {
        click(e);
      }
    }
    mousedownActive = false;
    pointRecord = undefined;
    options?.mouseupCallback?.(e, ...args);
  };

  return {
    onMousedown,
    onMouseup
  };
}

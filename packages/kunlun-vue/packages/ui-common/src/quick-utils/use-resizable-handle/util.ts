import { BASE_CLASS_NAME, Direction, HandleEventHandles, ResizableOptions, TARGET_CLASS_NAME } from './typing';

export function generatorHandleClassName(direction: Direction) {
  return `${BASE_CLASS_NAME}-${direction}-handle`;
}

export function openResizable(el: HTMLElement, options: ResizableOptions) {
  const { direction, handlePositions, eventHandles } = options;
  const className = `${BASE_CLASS_NAME}-${direction}`;
  el.classList.add(className);
  const negateDirection = getNegateDirection(direction);
  handlePositions.forEach((position) => {
    const handle = createHandle(negateDirection, eventHandles);
    handle.classList.add(`${generatorHandleClassName(negateDirection)}-${position}`);
    el.append(handle);
  });
}

function getNegateDirection(direction: Direction): Direction {
  if (direction === 'horizontal') {
    return 'vertical';
  }
  return 'horizontal';
}

function createCircle() {
  const circle = document.createElement('span');
  circle.classList.add(`${BASE_CLASS_NAME}-handle-circle`);
  return circle;
}

/**
 * 创建拖拽柄
 * @param direction 方向
 * @param eventHandles 事件
 */
function createHandle(direction: Direction, eventHandles: HandleEventHandles) {
  const handle = document.createElement('span');
  handle.append(createCircle(), createCircle(), createCircle());
  handle.classList.add(`${BASE_CLASS_NAME}-handle`);
  handle.classList.add(generatorHandleClassName(direction));
  handle.addEventListener('mousedown', eventHandles.onMousedown);
  handle.addEventListener('click', eventHandles.onClick);
  return handle;
}

const directions: Direction[] = ['horizontal', 'vertical'];

export function closeResizable(el: HTMLElement) {
  const { classList } = el;
  classList.remove(TARGET_CLASS_NAME);
  directions.forEach((direction) => {
    classList.remove(`${BASE_CLASS_NAME}-${direction}`);
  });
  const children = [...el.getElementsByClassName(`${BASE_CLASS_NAME}-handle`)];
  for (const child of children) {
    el.removeChild(child);
  }
}

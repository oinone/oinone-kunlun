import { VisibleArea } from './typing';

export function createVisibleArea(handle: string, el?: HTMLElement | (() => HTMLElement | undefined)): VisibleArea {
  const origin = { handle, el } as VisibleArea;
  return new Proxy(origin, {
    get(target, key, receiver) {
      switch (key) {
        case 'w':
          return target.el?.getBoundingClientRect().width || 0;
        case 'h':
          return target.el?.getBoundingClientRect().height || 0;
        case 'x':
          return target.el?.getBoundingClientRect().x || 0;
        case 'y':
          return target.el?.getBoundingClientRect().y || 0;
        case 'ex': {
          const rect = target.el?.getBoundingClientRect();
          if (!rect) {
            return 0;
          }
          return rect.x + rect.width;
        }
        case 'ey': {
          const rect = target.el?.getBoundingClientRect();
          if (!rect) {
            return 0;
          }
          return rect.y + rect.height;
        }
        case 'el': {
          const el = Reflect.get(target, key, receiver);
          if (typeof el === 'function') {
            return el();
          }
          return el;
        }
      }
      return Reflect.get(target, key, receiver);
    }
  });
}

import { VisibleArea } from './typing';

export function createVisibleArea(handle: string, el?: HTMLElement | (() => HTMLElement | undefined)): VisibleArea {
  const origin = { handle, el } as VisibleArea;
  return new Proxy(origin, {
    get(target, key, receiver) {
      let tel: HTMLElement | undefined;
      if (typeof el === 'function') {
        tel = el();
      } else {
        tel = el;
      }
      switch (key) {
        case 'w':
          return tel?.getBoundingClientRect().width || 0;
        case 'h':
          return tel?.getBoundingClientRect().height || 0;
        case 'x':
          return tel?.getBoundingClientRect().x || 0;
        case 'y':
          return tel?.getBoundingClientRect().y || 0;
        case 'ex': {
          const rect = tel?.getBoundingClientRect();
          if (!rect) {
            return 0;
          }
          return rect.x + rect.width;
        }
        case 'ey': {
          const rect = tel?.getBoundingClientRect();
          if (!rect) {
            return 0;
          }
          return rect.y + rect.height;
        }
        case 'el': {
          return tel;
        }
      }
      return Reflect.get(target, key, receiver);
    }
  });
}

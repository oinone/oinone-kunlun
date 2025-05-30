import { DEFAULT_PREFIX } from '../../theme';

const dragDropGhostClassName = `${DEFAULT_PREFIX}-drag-drop-ghost`;

export function useDragDrop(options?: {
  drag?: (e: MouseEvent) => boolean;
  move?: (e: MouseEvent) => void;
  drop?: (e: MouseEvent) => void;
}) {
  const drag = options?.drag || (() => true);

  const onMousedown = (e: MouseEvent) => {
    const { target } = e;
    if (!target) {
      return;
    }
    const src = target as HTMLElement;
    if (!drag(e)) {
      return;
    }
    src.draggable = true;
    src.classList.add(dragDropGhostClassName);
    src.style.transform = 'transformZ(0px)';

    const move = (ee: MouseEvent) => {
      options?.move?.(ee);
    };

    const drop = (ee: MouseEvent) => {
      src.draggable = false;
      src.classList.remove(dragDropGhostClassName);
      src.style.transform = '';
      document.removeEventListener('dragover', move);
      document.removeEventListener('dragend', drop);
      options?.drop?.(ee);
    };

    document.addEventListener('dragover', move);
    document.addEventListener('dragend', drop);
  };

  return {
    onMousedown
  };
}

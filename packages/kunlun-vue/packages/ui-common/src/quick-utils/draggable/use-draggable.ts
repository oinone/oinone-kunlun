import { ComputedRef, onBeforeUnmount, onMounted, Ref, watchEffect } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { StyleHelper } from '../../util';

const draggableClassName = `${DEFAULT_PREFIX}-draggable-hosted`;

export function useDraggable(
  targetRef: Ref<HTMLElement | undefined>,
  dragRef: Ref<HTMLElement | undefined>,
  draggable: ComputedRef<boolean>
): void {
  let transform = {
    offsetX: 0,
    offsetY: 0
  };

  const onMousedown = (e: MouseEvent) => {
    const downX = e.clientX;
    const downY = e.clientY;
    const { offsetX, offsetY } = transform;

    const targetRect = targetRef.value!.getBoundingClientRect();
    const targetLeft = targetRect.left;
    const targetTop = targetRect.top;
    const targetWidth = targetRect.width;
    const targetHeight = targetRect.height;

    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;

    const minLeft = -targetLeft + offsetX;
    const minTop = -targetTop + offsetY;
    const maxLeft = clientWidth - targetLeft - targetWidth + offsetX;
    const maxTop = clientHeight - targetTop - targetHeight + offsetY;

    const onMousemove = (moveEvent: MouseEvent) => {
      const moveX = Math.min(Math.max(offsetX + moveEvent.clientX - downX, minLeft), maxLeft);
      const moveY = Math.min(Math.max(offsetY + moveEvent.clientY - downY, minTop), maxTop);

      transform = {
        offsetX: moveX,
        offsetY: moveY
      };
      targetRef.value!.style.transform = `translate(${StyleHelper.px(moveX)}, ${StyleHelper.px(moveY)})`;
    };

    const onMouseup = () => {
      document.removeEventListener('mousemove', onMousemove);
      document.removeEventListener('mouseup', onMouseup);
    };

    document.addEventListener('mousemove', onMousemove);
    document.addEventListener('mouseup', onMouseup);
  };

  const onDraggable = () => {
    if (dragRef.value && targetRef.value) {
      targetRef.value.classList.add(draggableClassName);
      dragRef.value.addEventListener('mousedown', onMousedown);
    }
  };

  const offDraggable = () => {
    if (dragRef.value && targetRef.value) {
      targetRef.value.classList.remove(draggableClassName);
      dragRef.value.removeEventListener('mousedown', onMousedown);
    }
  };

  onMounted(() => {
    watchEffect(() => {
      if (draggable.value) {
        onDraggable();
      } else {
        offDraggable();
      }
    });
  });

  onBeforeUnmount(() => {
    offDraggable();
  });
}

import { unref } from 'vue';
import { UnrefType } from '../typing';

export interface ScrollOperator {
  updateScroll(): number;
}

export interface ScrollOperatorOptions {
  behavior?: ScrollBehavior;
  offset?: number;
  scrollThreshold?: number;
}

export function useScrollOperator(
  containerRef: UnrefType<HTMLElement | undefined>,
  targetRef: UnrefType<HTMLElement | undefined>,
  options?: UnrefType<ScrollOperatorOptions | undefined>
): { horizontal: ScrollOperator; vertical: ScrollOperator } {
  return {
    horizontal: {
      updateScroll(): number {
        const containerDom = unref(containerRef);
        const targetDom = unref(targetRef);
        if (!containerDom || !targetDom) {
          return 0;
        }
        const { behavior, offset, scrollThreshold } = getOptions(options);
        const { x: leftX, width } = containerDom.getBoundingClientRect();
        const rightX = leftX + width;
        const { x: targetLeftX, width: targetWidth } = targetDom.getBoundingClientRect();
        const targetRightX = targetLeftX + targetWidth;
        let result = 0;
        if (leftX > targetLeftX) {
          result = targetLeftX - leftX - offset;
          if (result !== 0 && (!scrollThreshold || (scrollThreshold && result >= scrollThreshold))) {
            containerDom.scrollBy({
              behavior,
              left: result
            });
          }
        } else if (rightX < targetRightX) {
          result = targetRightX - rightX + offset;
          if (result !== 0 && (!scrollThreshold || (scrollThreshold && result >= scrollThreshold))) {
            containerDom.scrollBy({
              behavior,
              left: result
            });
          }
        }
        return result;
      }
    },
    vertical: {
      /**
       * 未测试功能
       */
      updateScroll() {
        const containerDom = unref(containerRef);
        const targetDom = unref(targetRef);
        if (!containerDom || !targetDom) {
          return 0;
        }
        const { behavior, offset, scrollThreshold } = getOptions(options);
        const { y: topY, height } = containerDom.getBoundingClientRect();
        const bottomY = topY + height;
        const { y: targetTopY, height: targetHeight } = targetDom.getBoundingClientRect();
        const targetBottomY = targetTopY + targetHeight;
        let result = 0;
        if (topY > targetTopY) {
          result = targetTopY - topY - offset;
          if (result !== 0 && (!scrollThreshold || (scrollThreshold && result >= scrollThreshold))) {
            containerDom.scrollBy({
              behavior,
              top: result
            });
          }
        } else if (targetBottomY > bottomY) {
          result = targetBottomY - bottomY + offset;
          if (result !== 0 && (!scrollThreshold || (scrollThreshold && result >= scrollThreshold))) {
            containerDom.scrollBy({
              behavior,
              top: result
            });
          }
        }
        return result;
      }
    }
  };
}

function getOptions(options?: UnrefType<ScrollOperatorOptions | undefined>) {
  const finalOptions = unref(options);
  let behavior: ScrollBehavior = 'smooth';
  let offset = 0;
  let scrollThreshold = 0;
  if (finalOptions) {
    behavior = finalOptions.behavior || behavior;
    offset = finalOptions.offset || offset;
    scrollThreshold = finalOptions.scrollThreshold || scrollThreshold;
  }
  return {
    behavior,
    offset,
    scrollThreshold
  };
}

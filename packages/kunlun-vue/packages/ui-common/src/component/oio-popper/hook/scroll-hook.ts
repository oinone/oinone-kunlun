import { ComputedRef, Ref, ref, watch } from 'vue';

export interface ScrollState {
  readonly top: number;
  readonly left: number;
}

/**
 * 性能过差，不建议使用
 * @param target
 */
export default function scrollHook(target: ComputedRef<HTMLElement>): Ref<ScrollState> {
  const state = ref<ScrollState>({
    top: NaN,
    left: NaN
  });

  const updatePosition = (targetHTMLElement: HTMLElement) => {
    state.value = {
      top: targetHTMLElement.scrollTop,
      left: targetHTMLElement.scrollLeft
    };
  };

  const scrollListener = (event: Event) => {
    const scrollTarget = event.target;
    if (!scrollTarget || !(scrollTarget instanceof HTMLElement)) {
      return;
    }
    updatePosition(scrollTarget);
  };

  watch(
    () => target.value,
    (val, oldVal) => {
      if (oldVal) {
        oldVal.removeEventListener('scroll', scrollListener);
      }
      if (val) {
        val.addEventListener('scroll', scrollListener);
      }
    }
  );

  return state;
}

export interface CleanableEvent {
  el: HTMLElement | null | undefined;

  remove();
}

export function useCleanableEvent<K extends keyof HTMLElementEventMap>(
  el: HTMLElement,
  type: K,
  fn: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): CleanableEvent {
  el?.addEventListener?.(type, fn, options);
  return {
    el,
    remove: () => {
      el?.removeEventListener?.(type, fn);
    }
  };
}

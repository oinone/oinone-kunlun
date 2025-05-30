import { customRef, Ref } from 'vue';

/**
 * 防抖ref
 * @param value
 * @param delay
 */
export function useDebouncedRef<T>(value: T, delay = 200): Ref<T> {
  let timeout;
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          value = newValue;
          trigger();
        }, delay);
      }
    };
  });
}

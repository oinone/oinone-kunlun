import { BooleanHelper } from '@kunlun/shared';
import { cloneDeep } from 'lodash-es';
import { ref, watch } from 'vue';

export function usePopup(props, context) {
  const data = ref<object>({});

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.copy) {
          if (props.deep) {
            data.value = cloneDeep(props.data);
          } else {
            data.value = { ...props.data };
          }
        } else {
          data.value = props.data;
        }
      } else {
        data.value = {};
      }
    },
    { immediate: true }
  );

  const enter = (event: PointerEvent) => {
    callback(event, props.enterCallback);
  };

  const cancel = (event: PointerEvent) => {
    callback(event, props.cancelCallback);
  };

  const callback = (
    event: PointerEvent,
    fn: ((event: PointerEvent, data: object) => boolean | Promise<boolean> | null | undefined | void) | undefined
  ): void => {
    const submitData = { ...data.value };
    if (fn) {
      const result = fn(event, submitData);
      if (result instanceof Promise) {
        result.then((value) => {
          if (BooleanHelper.isTrue(value)) {
            context.emit('update:visible', false);
          }
        });
      } else if (result) {
        context.emit('update:visible', false);
      }
      return;
    }
    context.emit('update:visible', false);
  };

  return {
    data,
    enter,
    cancel
  };
}

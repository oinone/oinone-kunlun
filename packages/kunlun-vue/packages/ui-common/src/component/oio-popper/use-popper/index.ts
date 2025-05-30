import { isBoolean, isNil, isString } from 'lodash-es';
import { computed, reactive, SetupContext } from 'vue';
import { PopperTrigger } from '../props';
import createEvents from './events';
import PopperOptions from './popper-options';
import { EmitType, PopperState } from './typing';

export default function usePopper(props: PopperOptions, context: SetupContext<EmitType[]>) {
  const state = reactive<PopperState>({
    hoverVisible: !!props.visible,
    popperVisible: false
  });

  const realTrigger = computed<PopperTrigger[]>(() => {
    const triggers = [] as PopperTrigger[];
    const tgr = props.trigger;
    if (isNil(tgr)) {
      triggers.push(PopperTrigger.HOVER);
    } else if (isString(tgr)) {
      triggers.push(tgr as PopperTrigger);
    } else {
      for (const item of tgr) {
        triggers.push(item as PopperTrigger);
      }
    }
    return triggers;
  });

  const isManualMode = computed(() => {
    return realTrigger.value.includes(PopperTrigger.MANUAL);
  });

  const visibility = computed<boolean>({
    get() {
      if (props.disabled) {
        return false;
      }
      const { visible } = props;
      return (isBoolean(visible) ? visible : state.hoverVisible) || state.popperVisible;
    },
    set(val) {
      if (isManualMode.value) {
        return;
      }
      const { visible } = props;
      if (isBoolean(visible)) {
        context.emit('update:visible', val);
      } else {
        state.hoverVisible = val;
      }
    }
  });

  let rawTriggerFocused = false;
  const triggerFocused = computed<boolean>({
    get() {
      return rawTriggerFocused;
    },
    set(val) {
      rawTriggerFocused = val;
    }
  });

  const show = () => {
    visibility.value = true;
  };

  const hide = () => {
    visibility.value = false;
  };

  const events = createEvents(realTrigger.value, visibility, triggerFocused, show, hide);

  const onPopperMouseenter = () => {
    state.popperVisible = true;
  };

  const onPopperMouseleave = () => {
    state.popperVisible = false;
  };

  return {
    realTrigger,
    visibility,
    show,
    hide,
    events,
    onPopperMouseenter,
    onPopperMouseleave,
    onAfterEnter: () => {
      context.emit('after-enter');
    },
    onAfterLeave: () => {
      context.emit('after-leave');
    },
    onBeforeEnter: () => {
      context.emit('before-enter');
    },
    onBeforeLeave: () => {
      context.emit('before-leave');
    }
  };
}

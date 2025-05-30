import { unref, WritableComputedRef } from 'vue';
import { PopperTrigger } from '../props';
import { PopperEvents } from './typing';

function createBlurEvent(triggerFocused: WritableComputedRef<boolean>, hide: () => void) {
  return (e: Event) => {
    e.stopPropagation();
    triggerFocused.value = false;
    hide();
  };
}

function createHoverEvent(
  show: () => void,
  hide: () => void
): {
  onMouseenter: (e: Event) => void;
  onMouseleave: (e: Event) => void;
} {
  return {
    onMouseenter: (e: Event) => {
      e.stopPropagation();
      show();
    },
    onMouseleave: (e: Event) => {
      e.stopPropagation();
      hide();
    }
  };
}

function createClickEvent(
  visibility: WritableComputedRef<boolean>,
  triggerFocused: WritableComputedRef<boolean>,
  show: () => void,
  hide: () => void
): {
  onClick?: (e: Event) => void;
  onBlur?: (e: Event) => void;
} {
  return {
    onClick: (e: Event) => {
      e.stopPropagation();
      if (triggerFocused.value) {
        triggerFocused.value = false;
      } else if (unref(visibility.value)) {
        hide();
      } else {
        show();
      }
    },
    onBlur: createBlurEvent(triggerFocused, hide)
  };
}

function createFocusEvent(
  triggerFocused: WritableComputedRef<boolean>,
  show: () => void,
  hide: () => void
): {
  onFocus?: (e: Event) => void;
  onBlur?: (e: Event) => void;
} {
  return {
    onFocus: (e: Event) => {
      e.stopPropagation();
      triggerFocused.value = true;
      show();
    },
    onBlur: createBlurEvent(triggerFocused, hide)
  };
}

export default function createEvents(
  triggers: PopperTrigger[],
  visibility: WritableComputedRef<boolean>,
  triggerFocused: WritableComputedRef<boolean>,
  show: () => void,
  hide: () => void
): PopperEvents {
  const events = {} as PopperEvents;
  for (const trigger of triggers) {
    switch (trigger) {
      case PopperTrigger.MANUAL:
        return {};
      case PopperTrigger.HOVER: {
        const hoverEvents = createHoverEvent(show, hide);
        events.onMouseenter = hoverEvents.onMouseenter;
        events.onMouseleave = hoverEvents.onMouseleave;
        break;
      }
      case PopperTrigger.CLICK: {
        const clickEvents = createClickEvent(visibility, triggerFocused, show, hide);
        events.onClick = clickEvents.onClick;
        events.onBlur = clickEvents.onBlur;
        break;
      }
      case PopperTrigger.FOCUS: {
        const focusEvents = createFocusEvent(triggerFocused, show, hide);
        events.onFocus = focusEvents.onFocus;
        events.onBlur = focusEvents.onBlur;
        break;
      }
      case PopperTrigger.CONTEXTMENU:
        break;
      default:
        console.warn(`Invalid trigger value. value=${trigger}`);
        break;
    }
  }
  return events;
}

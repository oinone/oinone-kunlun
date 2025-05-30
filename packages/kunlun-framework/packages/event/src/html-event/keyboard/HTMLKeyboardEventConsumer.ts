import { useEnv } from '@kunlun/environment';
import {
  AbstractEventConsumer,
  EventCategory,
  EventCategoryType,
  EventConsumerConstructor,
  EventConsumerFunction,
  EventConsumerOptions,
  EventConsumerScope,
  HTMLKeyboardEventConsumerConfig,
  KeyboardEventMessage,
  KeyboardTypes,
  registerEventConsumer
} from '../../bus';

type KeyboardEventConsumerOptions = EventConsumerOptions<
  KeyboardEvent,
  KeyboardEvent,
  KeyboardEventMessage,
  HTMLKeyboardEventConsumerConfig
>;

class AbstractKeyboardEventConsumer extends AbstractEventConsumer<
  string,
  KeyboardEvent,
  KeyboardEvent,
  KeyboardEventMessage,
  HTMLKeyboardEventConsumerConfig
> {
  public constructor(
    category: EventCategoryType,
    type: string,
    consumer: EventConsumerFunction<
      string,
      KeyboardEvent,
      KeyboardEvent,
      KeyboardEventMessage,
      HTMLKeyboardEventConsumerConfig
    >,
    options?: KeyboardEventConsumerOptions
  ) {
    super(category, type, consumer, options);
    this.initConfig();
  }

  protected initConfig(): void {
    const { config } = this;
    if (config.scope == null) {
      config.scope = EventConsumerScope.view;
    }
    if (config.ctrl === undefined) {
      config.ctrl = false;
    }
    if (config.shift === undefined) {
      config.shift = false;
    }
    if (config.alt === undefined) {
      config.alt = false;
    }
  }

  protected $$filter(ev: KeyboardEvent, message: KeyboardEventMessage) {
    const { scope, ctrl, alt, shift } = this.config;
    let isTrigger = false;
    switch (scope) {
      case EventConsumerScope.global:
      case EventConsumerScope.current:
        isTrigger = true;
        break;
      case EventConsumerScope.view: {
        const { el } = this;
        if (!el) {
          break;
        }
        const { x: clientX, y: clientY } = el.getBoundingClientRect();
        const env = useEnv();
        const clickVisibleArea = env.clickVisibleArea[0];
        if (clickVisibleArea) {
          const { el: visibleEl, x, y, ex, ey } = clickVisibleArea;
          if (visibleEl) {
            if (visibleEl.contains(el)) {
              isTrigger = true;
            }
          } else if (x <= clientX && clientX <= ex && y <= clientY && clientY <= ey) {
            isTrigger = true;
            break;
          }
        } else {
          // fixme @zbh 20241216 此处逻辑无法闭合，暂时不启用
          // for (const visibleArea of env.visibleArea.values()) {
          //   const { x, y, ex, ey } = visibleArea;
          //   if (x <= clientX && clientX <= ex && y <= clientY && clientY <= ey) {
          //     isTrigger = true;
          //     break;
          //   }
          // }
          // if (!isTrigger) {
          //   const { x, y, ex, ey } = env.contentVisibleArea;
          //   if (x <= clientX && clientX <= ex && y <= clientY && clientY <= ey) {
          //     isTrigger = true;
          //     break;
          //   }
          // }
        }
        break;
      }
    }
    if (!isTrigger) {
      return false;
    }
    if (ctrl != null && ctrl !== message.ctrl) {
      return false;
    }
    if (shift != null && shift !== message.shift) {
      return false;
    }
    if (alt != null && alt !== message.alt) {
      return false;
    }
    return true;
  }
}

export class HTMLKeyboardEventConsumer extends AbstractKeyboardEventConsumer {
  public constructor(
    type: string,
    consumer: EventConsumerFunction<
      string,
      KeyboardEvent,
      KeyboardEvent,
      KeyboardEventMessage,
      HTMLKeyboardEventConsumerConfig
    >,
    options?: KeyboardEventConsumerOptions
  ) {
    super(EventCategory.html, type, consumer, options);
  }
}

export class KeyboardEventConsumer extends AbstractKeyboardEventConsumer {
  public constructor(
    type: string,
    consumer: EventConsumerFunction<
      string,
      KeyboardEvent,
      KeyboardEvent,
      KeyboardEventMessage,
      HTMLKeyboardEventConsumerConfig
    >,
    options?: KeyboardEventConsumerOptions
  ) {
    super(EventCategory.keyboard, type, consumer, options);
  }
}

registerEventConsumer(
  { category: EventCategory.html, type: KeyboardTypes },
  HTMLKeyboardEventConsumer as EventConsumerConstructor
);
registerEventConsumer({ category: EventCategory.keyboard }, KeyboardEventConsumer as EventConsumerConstructor);

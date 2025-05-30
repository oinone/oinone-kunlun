import { KeyboardEventHelper } from '@kunlun/shared';
import {
  EventCategory,
  EventProducer,
  EventProducerConstructor,
  EventProducerOptions,
  KeyboardEventMessage,
  KeyboardType,
  KeyboardTypes,
  registerEventProducer
} from '../../bus';
import { AbstractHTMLEventProducer } from '../basic';

abstract class AbstractHTMLKeyboardEventProducer<K extends KeyboardType> extends AbstractHTMLEventProducer<
  K,
  KeyboardEvent
> {
  protected $$convert(self: EventProducer<K, KeyboardEvent>, ev: KeyboardEvent): KeyboardEventMessage | undefined {
    const helper = KeyboardEventHelper.newInstance(ev);
    if (helper.isStateKey()) {
      return undefined;
    }
    return {
      category: this.category,
      type: this.type,
      origin: ev,
      code: ev.code,
      key: ev.key,
      ctrl: helper.isPressCtrl(),
      alt: helper.isPressAlt(),
      shift: helper.isPressShift()
    };
  }
}

export class HTMLKeyboardEventProducer<K extends KeyboardType> extends AbstractHTMLKeyboardEventProducer<K> {
  public constructor(type: K, options?: EventProducerOptions<K, KeyboardEvent>) {
    super(EventCategory.html, type, options);
  }
}

export class KeyboardEventProducer<K extends KeyboardType> extends AbstractHTMLKeyboardEventProducer<K> {
  public constructor(type: K, options?: EventProducerOptions<K, KeyboardEvent>) {
    super(EventCategory.keyboard, type, options);
  }

  protected $$convert(self: EventProducer<K, KeyboardEvent>, ev: KeyboardEvent): KeyboardEventMessage | undefined {
    const message = super.$$convert(self, ev);
    if (message) {
      message.type = ev.key;
    }
    return message;
  }

  protected onKeydown(ev: KeyboardEvent) {
    this.publish(ev);
  }

  protected $$start() {
    document.addEventListener('keydown', this.onKeydown.bind(this));
  }

  protected $$stop() {
    document.removeEventListener('keydown', this.onKeydown.bind(this));
  }
}

registerEventProducer(
  { category: EventCategory.html, type: KeyboardTypes },
  HTMLKeyboardEventProducer as EventProducerConstructor
);
registerEventProducer({ category: EventCategory.keyboard }, KeyboardEventProducer as EventProducerConstructor);

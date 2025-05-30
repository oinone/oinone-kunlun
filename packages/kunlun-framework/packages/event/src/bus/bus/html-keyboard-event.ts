import { ProducerOperator } from '../operator';
import {
  EventCategory,
  EventConsumer,
  EventConsumerFunction,
  EventConsumerOptions,
  EventProducer,
  HTMLKeyboardEventConsumerConfig,
  KeyboardEventMessage
} from '../typing';
import { Basic } from './basic';

const PRODUCER_TYPE = 'global';

export class HTMLKeyboardEvent {
  public static init(): EventProducer {
    return Basic.init({ category: EventCategory.keyboard, type: PRODUCER_TYPE });
  }

  public static dispose(): EventProducer | undefined {
    return ProducerOperator.dispose(`${EventCategory.keyboard}#${PRODUCER_TYPE}`);
  }

  public static subscribe(
    type: string | '*',
    consumerFn: EventConsumerFunction<
      string,
      KeyboardEvent,
      KeyboardEvent,
      KeyboardEventMessage,
      HTMLKeyboardEventConsumerConfig
    >,
    consumerOptions?: EventConsumerOptions<
      KeyboardEvent,
      KeyboardEvent,
      KeyboardEventMessage,
      HTMLKeyboardEventConsumerConfig
    >,
    autoInitProducer = true
  ): EventConsumer<string, KeyboardEvent, KeyboardEvent, KeyboardEventMessage, HTMLKeyboardEventConsumerConfig> {
    if (autoInitProducer) {
      HTMLKeyboardEvent.init();
    }
    return Basic.subscribe({ category: EventCategory.keyboard, type }, consumerFn, consumerOptions);
  }
}

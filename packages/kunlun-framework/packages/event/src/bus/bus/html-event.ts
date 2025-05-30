import { ProducerOperator } from '../operator';
import {
  EventCategory,
  EventConsumer,
  EventConsumerConfig,
  EventConsumerFunction,
  EventConsumerOptions,
  EventMessage,
  EventProducer
} from '../typing';
import { Basic } from './basic';

export class HTMLEvent {
  public static init<K extends keyof HTMLElementEventMap, EV = HTMLElementEventMap[K]>(
    type: K | '*'
  ): EventProducer<K, EV> {
    return Basic.init({ category: EventCategory.html, type });
  }

  public static dispose<K extends keyof HTMLElementEventMap>(
    type: K | '*'
  ): EventProducer<K, HTMLElementEventMap[K]> | undefined {
    return ProducerOperator.dispose(`${EventCategory.html}#${type}`);
  }

  public static subscribe<
    K extends keyof HTMLElementEventMap,
    EV = HTMLElementEventMap[K],
    V = EV,
    M extends EventMessage<V> = EventMessage<V>,
    C extends EventConsumerConfig = EventConsumerConfig
  >(
    type: K | '*',
    consumerFn: EventConsumerFunction<K, EV, V, M, C>,
    consumerOptions?: EventConsumerOptions<EV, V, M, C>,
    autoInitProducer = true
  ): EventConsumer<K, EV, V, M, C> {
    if (autoInitProducer) {
      HTMLEvent.init(type);
    }
    return Basic.subscribe({ category: EventCategory.html, type }, consumerFn, consumerOptions);
  }
}

import { SPIOperator, SPIOptions } from '@kunlun/spi';
import { EventCategoryType, EventConsumerConfig, EventConsumerConstructor, EventMessage } from '../typing';

const EVENT_BUS_CONSUMER_KEY = Symbol('__event_bus_consumer');

export interface EventBusConsumerOptions extends SPIOptions {
  category: EventCategoryType | EventCategoryType[];
  type?: string | string[];
}

SPIOperator.createStorage({
  key: EVENT_BUS_CONSUMER_KEY,
  matchKeys: ['category', 'type']
});

export function registerEventConsumer<
  K = string,
  EV = unknown,
  V = EV,
  M extends EventMessage<V> = EventMessage<V>,
  C extends EventConsumerConfig = EventConsumerConfig
>(options: EventBusConsumerOptions, constructor: EventConsumerConstructor<K, EV, V, M, C>) {
  return SPIOperator.register(EVENT_BUS_CONSUMER_KEY, options, constructor);
}

export function selectorEventConsumer<
  K = string,
  EV = unknown,
  V = EV,
  M extends EventMessage<V> = EventMessage<V>,
  C extends EventConsumerConfig = EventConsumerConfig
>(options: EventBusConsumerOptions): EventConsumerConstructor<K, EV, V, M, C> | undefined {
  return SPIOperator.selector(EVENT_BUS_CONSUMER_KEY, options);
}

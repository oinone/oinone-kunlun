import { SPIOperator, SPIOptions } from '@oinone/kunlun-spi';
import { EventCategoryType, EventProducerConstructor } from '../typing';

const EVENT_BUS_PRODUCER_KEY = Symbol('__event_bus_producer');

export interface EventBusProducerOptions extends SPIOptions {
  category: EventCategoryType | EventCategoryType[];
  type?: string | string[];
}

SPIOperator.createStorage({
  key: EVENT_BUS_PRODUCER_KEY,
  matchKeys: ['category', 'type']
});

export function registerEventProducer<K = string, EV = unknown, V = EV>(
  options: EventBusProducerOptions,
  constructor: EventProducerConstructor<K, EV, V>
) {
  return SPIOperator.register(EVENT_BUS_PRODUCER_KEY, options, constructor);
}

export function selectorEventProducer<K = string, EV = unknown, V = EV>(
  options: EventBusProducerOptions
): EventProducerConstructor<K, EV, V> | undefined {
  return SPIOperator.selector(EVENT_BUS_PRODUCER_KEY, options);
}

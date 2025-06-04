import { instantiate } from '@oinone/kunlun-shared';
import { selectorEventProducer } from '../spi';
import { EventCategoryType, EventEngineOptions, EventProducer, EventProducerOptions } from '../typing';

export class ProducerOperator {
  private static producers: Map<string, EventProducer<unknown>> = new Map<
    string,
    EventProducer<unknown, unknown, unknown>
  >();

  public static getProducer<K = string, EV = unknown, V = EV>(
    category: EventCategoryType,
    type: string
  ): EventProducer<K, EV, V> | undefined {
    return ProducerOperator.producers.get(ProducerOperator.generatorKey(category, type)) as
      | EventProducer<K, EV, V>
      | undefined;
  }

  public static construct<K = string, EV = unknown, V = EV>(
    options: EventEngineOptions,
    producerOptions?: EventProducerOptions<K, EV, V>
  ): EventProducer<K, EV, V> {
    const ProducerConstructor = selectorEventProducer<K, EV, V>(options);
    if (!ProducerConstructor) {
      throw new Error(`Unsupported producer. category: ${options.category}, type: ${options.type}`);
    }
    return instantiate(ProducerConstructor, options.type, producerOptions);
  }

  public static init<K = string, EV = unknown, V = EV>(producer: EventProducer<K, EV, V>): void {
    const key = ProducerOperator.generatorKeyByEngine(producer);
    ProducerOperator.dispose(key);
    ProducerOperator.producers.set(key, producer);
    producer.start();
  }

  public static dispose<K = string, EV = unknown, V = EV>(key: string): EventProducer<K, EV, V> | undefined {
    const producer = ProducerOperator.producers.get(key);
    if (producer) {
      ProducerOperator.producers.delete(key);
      if (!producer.isDisposed) {
        producer.dispose();
      }
    }
    return producer as EventProducer<K, EV, V> | undefined;
  }

  public static generatorKey(category: string, type: string) {
    return `${category}#${type}`;
  }

  public static generatorKeyByEngine<K = string, EV = unknown, V = EV>(producer: EventProducer<K, EV, V>) {
    return `${producer.category}#${producer.type}`;
  }
}

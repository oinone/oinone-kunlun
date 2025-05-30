import { useCurrentInstance } from '@kunlun/environment';
import { instantiate } from '@kunlun/shared';
import { selectorEventConsumer } from '../spi';
import {
  EventConsumer,
  EventConsumerConfig,
  EventConsumerFunction,
  EventConsumerOptions,
  EventEngineOptions,
  EventMessage
} from '../typing';

export class ConsumerOperator {
  private static consumers: Map<string, EventConsumer<unknown, unknown, unknown>[]> = new Map<
    string,
    EventConsumer<unknown, unknown, unknown>[]
  >();

  public static getConsumers(message: EventMessage) {
    return ConsumerOperator.consumers.get(ConsumerOperator.generatorKeyByMessage(message));
  }

  public static construct<
    K = string,
    EV = unknown,
    V = EV,
    M extends EventMessage<V> = EventMessage<V>,
    C extends EventConsumerConfig = EventConsumerConfig
  >(
    options: EventEngineOptions,
    consumer: EventConsumerFunction<K, EV, V, M, C>,
    consumerOptions?: EventConsumerOptions<EV, V, M, C>
  ): EventConsumer<K, EV, V, M, C> {
    const ConsumerConstructor = selectorEventConsumer<K, EV, V, M, C>(options);
    if (!ConsumerConstructor) {
      throw new Error(`Unsupported consumer. category: ${options.category}, type: ${options.type}`);
    }
    const consumerInstance = instantiate(ConsumerConstructor, options.type, consumer, consumerOptions);
    consumerInstance.el = useCurrentInstance().currentInstance?.vNode.el;
    return consumerInstance;
  }

  public static init<K = string, EV = unknown, V = EV>(consumer: EventConsumer<K, EV, V>): void {
    const key = ConsumerOperator.generatorKeyByEngine(consumer);
    let consumers = ConsumerOperator.consumers.get(key);
    if (!consumers) {
      consumers = [];
      ConsumerOperator.consumers.set(key, consumers);
    }
    consumers.push(consumer);
    consumer.start();
  }

  public static dispose<K = string, EV = unknown, V = EV>(consumer: EventConsumer<K, EV, V>): boolean {
    const gk = ConsumerOperator.generatorKeyByEngine(consumer);
    const ck = consumer.key;
    const consumers = ConsumerOperator.consumers.get(gk);
    if (!consumers) {
      return false;
    }
    const pos = consumers.findIndex((v) => v.key === ck);
    if (pos === -1) {
      return false;
    }
    const deleteConsumers = consumers.splice(pos, 1);
    for (const deleteConsumer of deleteConsumers) {
      deleteConsumer.dispose();
    }
    return true;
  }

  public static generatorKey(category: string, type: string) {
    return `${category}#${type}`;
  }

  public static generatorKeyByEngine<K = string, EV = unknown, V = EV>(consumer: EventConsumer<K, EV, V>) {
    return `${consumer.category}#${consumer.type}`;
  }

  public static generatorKeyByMessage(message: EventMessage) {
    return `${message.category}#${message.type}`;
  }
}

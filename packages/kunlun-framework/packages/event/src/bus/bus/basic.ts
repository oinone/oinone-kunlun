import { ConsumerOperator, ProducerOperator } from '../operator';
import {
  EventConsumer,
  EventConsumerConfig,
  EventConsumerFunction,
  EventConsumerOptions,
  EventEngineOptions,
  EventMessage,
  EventProducer,
  EventProducerOptions
} from '../typing';

export class Basic {
  private static consumerMap: Map<Function, EventConsumer<unknown, unknown, unknown>> = new Map<
    EventConsumerFunction,
    EventConsumer
  >();

  public static init<K = string, EV = unknown, V = EV>(
    options: EventEngineOptions,
    producerOptions?: EventProducerOptions<K, EV, V>
  ): EventProducer<K, EV, V> {
    const { category, type } = options;
    let producer = ProducerOperator.getProducer<K, EV, V>(category, type);
    if (!producer) {
      producer = ProducerOperator.construct<K, EV, V>(
        {
          category,
          type
        },
        producerOptions
      );
      ProducerOperator.init(producer);
    }
    return producer;
  }

  public static startProducer(options: EventEngineOptions): boolean {
    const { category, type } = options;
    const producer = ProducerOperator.getProducer(category, type);
    if (producer) {
      return producer.start();
    }
    return false;
  }

  public static stopProducer(options: EventEngineOptions): boolean {
    const { category, type } = options;
    const producer = ProducerOperator.getProducer(category, type);
    if (producer) {
      return producer.stop();
    }
    return false;
  }

  public static publish<K = string, EV = unknown, V = EV>(options: EventEngineOptions, ev: EV): void {
    const { category, type } = options;
    const producer = ProducerOperator.getProducer<K, EV, V>(category, type);
    if (!producer) {
      throw new Error('Invalid producer. please initialize the producer before publish.');
    }
    producer.publish(ev);
  }

  public static subscribe<
    K = string,
    EV = unknown,
    V = EV,
    M extends EventMessage<V> = EventMessage<V>,
    C extends EventConsumerConfig = EventConsumerConfig
  >(
    options: EventEngineOptions,
    consumerFn: EventConsumerFunction<K, EV, V, M, C>,
    consumerOptions?: EventConsumerOptions<EV, V, M, C>
  ): EventConsumer<K, EV, V, M, C> {
    const consumer = ConsumerOperator.construct<K, EV, V, M, C>(options, consumerFn, consumerOptions);
    ConsumerOperator.init(consumer);
    Basic.consumerMap.set(consumerFn, consumer);
    return consumer;
  }

  public static unsubscribe<
    K = string,
    EV = unknown,
    V = EV,
    M extends EventMessage<V> = EventMessage<V>,
    C extends EventConsumerConfig = EventConsumerConfig
  >(consumerFn: EventConsumerFunction<K, EV, V, M, C>): EventConsumer<K, EV, V> | undefined {
    const consumer = Basic.consumerMap.get(consumerFn);
    if (consumer) {
      Basic.consumerMap.delete(consumerFn);
      ConsumerOperator.dispose(consumer);
    }
    return consumer as EventConsumer<K, EV, V> | undefined;
  }

  public static startConsumer<
    K = string,
    EV = unknown,
    V = EV,
    M extends EventMessage<V> = EventMessage<V>,
    C extends EventConsumerConfig = EventConsumerConfig
  >(consumerFn: EventConsumerFunction<K, EV, V, M, C>): boolean {
    const consumer = Basic.consumerMap.get(consumerFn);
    if (consumer) {
      return consumer.start();
    }
    return false;
  }

  public static stopConsumer<
    K = string,
    EV = unknown,
    V = EV,
    M extends EventMessage<V> = EventMessage<V>,
    C extends EventConsumerConfig = EventConsumerConfig
  >(consumerFn: EventConsumerFunction<K, EV, V, M, C>): boolean {
    const consumer = Basic.consumerMap.get(consumerFn);
    if (consumer) {
      return consumer.stop();
    }
    return false;
  }
}

import { EventCategoryType } from './category';

export interface EventEngine<K = string> {
  key: string;

  category: EventCategoryType;

  type: K;

  isActivated: boolean;

  isDisposed: boolean;

  start(): boolean;

  stop(): boolean;

  dispose(): boolean;
}

export interface EventProducer<K = string, EV = unknown, V = EV> extends EventEngine<K> {
  convert(ev: EV): EventMessage<V> | undefined;

  publish(ev: EV): void;
}

export type EventProducerConstructor<K = string, EV = unknown, V = EV> =
  | (new (type: string, options?: EventProducerOptions<K, EV, V>) => EventProducer<K, EV, V>)
  | EventProducer<K, EV, V>;

export interface EventProducerOptions<K = string, EV = unknown, V = EV> {
  convert?: EventConvertFunction<K, EV, V>;
  publish?: EventPublishFunction<K, EV, V>;
}

export type EventConvertFunction<K = string, EV = unknown, V = EV> = (
  self: EventProducer<K, EV, V>,
  ev: EV
) => EventMessage<V> | undefined;

export type EventPublishFunction<K = string, EV = unknown, V = EV> = (self: EventProducer<K, EV, V>, ev: EV) => void;

export interface EventConsumer<
  K = string,
  EV = unknown,
  V = EV,
  M extends EventMessage<V> = EventMessage<V>,
  C extends EventConsumerConfig = EventConsumerConfig
> extends EventEngine<K> {
  el?: HTMLElement;

  config: C;

  filter(ev: EV, message: M): boolean;

  consumer(message: M): void;
}

export type EventConsumerConstructor<
  K = string,
  EV = unknown,
  V = EV,
  M extends EventMessage<V> = EventMessage<V>,
  C extends EventConsumerConfig = EventConsumerConfig
> = new (
  type: string,
  consumer: EventConsumerFunction<K, EV, V, M, C>,
  options?: EventConsumerOptions<EV, V, M, C>
) => EventConsumer<K, EV, V, M, C>;

export interface EventConsumerOptions<
  EV = unknown,
  V = EV,
  M extends EventMessage<V> = EventMessage<V>,
  C extends EventConsumerConfig = EventConsumerConfig
> {
  config?: C;
  filter?: EventConsumerFilter<EV, V, M>;
}

export interface EventConsumerConfig {
  /**
   * 作用范围
   */
  scope?: EventConsumerScope;
  /**
   * 指针悬浮时启用
   */
  pointerActivated?: boolean;
  /**
   * 隐藏时禁用
   */
  invisibleDeactivated?: boolean;

  [key: string]: unknown;
}

export type EventConsumerFilter<EV = unknown, V = EV, M extends EventMessage<V> = EventMessage<V>> = (
  ev: EV,
  message: M
) => boolean;

export type EventConsumerFunction<
  K = string,
  EV = unknown,
  V = EV,
  M extends EventMessage<V> = EventMessage<V>,
  C extends EventConsumerConfig = EventConsumerConfig
> = (self: EventConsumer, message: M) => void;

export interface EventMessage<V = unknown> {
  category: EventCategoryType;
  type: string;
  origin: V;
}

export type EventEngineOptions = {
  category: EventCategoryType;
  type: string | '*';
};

export enum EventConsumerScope {
  global = 'global',
  view = 'view',
  current = 'current'
}

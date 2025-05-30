import {
  AbstractEventConsumer,
  EventCategory,
  EventConsumerConfig,
  EventConsumerConstructor,
  EventConsumerFunction,
  EventConsumerOptions,
  EventMessage,
  registerEventConsumer
} from '../../bus';

export class HTMLEventConsumer<
  K extends keyof HTMLElementEventMap,
  M extends EventMessage<HTMLElementEventMap[K]> = EventMessage<HTMLElementEventMap[K]>,
  C extends EventConsumerConfig = EventConsumerConfig
> extends AbstractEventConsumer<K, HTMLElementEventMap[K], HTMLElementEventMap[K], M, C> {
  public constructor(
    type: K,
    consumer: EventConsumerFunction<K, HTMLElementEventMap[K], HTMLElementEventMap[K], M, C>,
    options?: EventConsumerOptions<HTMLElementEventMap[K], HTMLElementEventMap[K], M, C>
  ) {
    super(EventCategory.html, type, consumer, options);
  }
}

registerEventConsumer({ category: EventCategory.html }, HTMLEventConsumer as EventConsumerConstructor);

import { ConsumerOperator } from '../operator';
import {
  EventCategoryType,
  EventConsumer,
  EventConsumerConfig,
  EventConsumerFilter,
  EventConsumerFunction,
  EventConsumerOptions,
  EventMessage
} from '../typing';
import { AbstractEventEngine } from './AbstractEventEngine';

let counter = 0;

export abstract class AbstractEventConsumer<
    K = string,
    EV = unknown,
    V = EV,
    M extends EventMessage<V> = EventMessage<V>,
    C extends EventConsumerConfig = EventConsumerConfig
  >
  extends AbstractEventEngine<K>
  implements EventConsumer<K, EV, V, M, C>
{
  public el: HTMLElement | undefined;

  private readonly _config: C;

  private readonly _rawFilter: EventConsumerFilter<EV, V, M>;

  private readonly _rawConsumer: EventConsumerFunction<K, EV, V, M, C>;

  protected constructor(
    category: EventCategoryType,
    type: K,
    consumer: EventConsumerFunction<K, EV, V, M, C>,
    options?: EventConsumerOptions<EV, V, M, C>
  ) {
    super(category, type);
    this._config = options?.config || ({} as C);
    this._rawFilter = options?.filter || this.$$filter.bind(this);
    this._rawConsumer = consumer;
  }

  public get config(): C {
    return this._config;
  }

  protected get rawFilter(): EventConsumerFilter<EV, V, M> {
    return this._rawFilter;
  }

  protected get rawConsumer(): EventConsumerFunction<K, EV, V, M, C> {
    return this._rawConsumer;
  }

  public filter(ev: EV, message: M): boolean {
    if (this.isActivated) {
      return this.rawFilter(ev, message);
    }
    return false;
  }

  protected $$filter(ev: EV, message: M) {
    return true;
  }

  public consumer(message: M): void {
    return this.rawConsumer(this as unknown as EventConsumer, message);
  }

  protected generatorKey(): string {
    return `event_consumer_${counter++}`;
  }

  protected $$dispose(): void {
    ConsumerOperator.dispose(this);
  }
}

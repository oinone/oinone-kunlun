import { ConsumerOperator, ProducerOperator } from '../operator';
import {
  EventCategoryType,
  EventConvertFunction,
  EventMessage,
  EventProducer,
  EventProducerOptions,
  EventPublishFunction
} from '../typing';
import { AbstractEventEngine } from './AbstractEventEngine';

let counter = 0;

export abstract class AbstractEventProducer<K = string, EV = unknown, V = EV>
  extends AbstractEventEngine<K>
  implements EventProducer<K, EV, V>
{
  private readonly _rawConvert: EventConvertFunction<K, EV, V>;

  private readonly _rawPublish: EventPublishFunction<K, EV, V>;

  protected constructor(category: EventCategoryType, type: K, options?: EventProducerOptions<K, EV, V>) {
    super(category, type);
    this._rawConvert = options?.convert || this.$$convert;
    this._rawPublish = options?.publish || this.$$publish;
  }

  public get rawConvert(): EventConvertFunction<K, EV, V> {
    return this._rawConvert;
  }

  public get rawPublish(): EventPublishFunction<K, EV, V> {
    return this._rawPublish;
  }

  public convert(ev: EV): EventMessage<V> | undefined {
    return this.rawConvert(this, ev);
  }

  protected abstract $$convert(self: EventProducer<K, EV, V>, ev: EV): EventMessage<V> | undefined;

  public publish(ev: EV): void {
    this.rawPublish(this, ev);
  }

  protected $$publish(self: EventProducer<K, EV, V>, ev: EV): void {
    const message = this.convert(ev);
    if (!message) {
      return;
    }
    const consumers = ConsumerOperator.getConsumers(message);
    if (consumers && consumers.length) {
      consumers.filter((v) => v.filter(ev, message)).map(async (v) => v.consumer(message));
    }
  }

  protected generatorKey(): string {
    return `event_producer_${counter++}`;
  }

  protected $$dispose(): void {
    ProducerOperator.dispose(ProducerOperator.generatorKeyByEngine(this));
  }
}

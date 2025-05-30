import { AbstractEventProducer, EventCategoryType, EventMessage, EventProducer, EventProducerOptions } from '../../bus';

export abstract class AbstractHTMLEventProducer<
  K extends keyof HTMLElementEventMap,
  EV extends HTMLElementEventMap[K] = HTMLElementEventMap[K]
> extends AbstractEventProducer<K, HTMLElementEventMap[K]> {
  protected constructor(
    category: EventCategoryType,
    type: K,
    options?: EventProducerOptions<K, HTMLElementEventMap[K]>
  ) {
    super(category, type, options);
  }

  protected $$convert(self: EventProducer<K, EV>, ev: EV): EventMessage<EV> | undefined {
    return {
      category: this.category,
      type: this.type,
      origin: ev
    };
  }

  protected $$start() {
    document.addEventListener(this.type, this.publish.bind(this));
  }

  protected $$stop() {
    document.removeEventListener(this.type, this.publish.bind(this));
  }
}

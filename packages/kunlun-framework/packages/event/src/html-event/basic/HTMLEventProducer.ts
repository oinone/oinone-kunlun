import { EventCategory, EventProducerConstructor, EventProducerOptions, registerEventProducer } from '../../bus';
import { AbstractHTMLEventProducer } from './AbstractHTMLEventProducer';

export class HTMLEventProducer<K extends keyof HTMLElementEventMap> extends AbstractHTMLEventProducer<K> {
  public constructor(type: K, options?: EventProducerOptions<K, HTMLElementEventMap[K]>) {
    super(EventCategory.html, type, options);
  }
}

registerEventProducer({ category: EventCategory.html }, HTMLEventProducer as EventProducerConstructor);

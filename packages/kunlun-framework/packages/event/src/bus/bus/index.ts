import { ConsumerOperator, ProducerOperator } from '../operator';
import { Basic } from './basic';
import { HTMLEvent } from './html-event';
import { HTMLKeyboardEvent } from './html-keyboard-event';

export class EventBus {
  public static init = Basic.init;

  public static startProducer = Basic.startProducer;

  public static stopProducer = Basic.stopProducer;

  public static publish = Basic.publish;

  public static subscribe = Basic.subscribe;

  public static unsubscribe = Basic.unsubscribe;

  public static start = Basic.startConsumer;

  public static stop = Basic.stopConsumer;

  // public static constructProducer = ProducerOperator.construct;

  // public static initProducer = ProducerOperator.init;

  public static disposeProducer = ProducerOperator.dispose;

  // public static constructConsumer = ConsumerOperator.construct;

  // public static initConsumer = ConsumerOperator.init;

  public static disposeConsumer = ConsumerOperator.dispose;

  // public static initHTMLProducer = HTMLEvent.init;

  // public static disposeHTMLProducer = HTMLEvent.dispose;

  public static subscribeHTMLEvent = HTMLEvent.subscribe;

  // public static initKeyboardProducer = HTMLKeyboardEvent.init;

  // public static disposeKeyboardProducer = HTMLKeyboardEvent.dispose;

  public static subscribeKeyboardEvent = HTMLKeyboardEvent.subscribe;
}

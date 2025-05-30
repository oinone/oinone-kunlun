import { filter, Subject } from '@kunlun/state';
import { ILevel, IMessage } from '../../types';
import { IMessageHub, MessageHubHandler } from '../typing';
import { MessageHubManager } from './manager';

/**
 * message hub
 */
export class MessageHub implements IMessageHub {
  private sub$ = new Subject<IMessage>();

  public constructor(private readonly identifier: string) {
    this.identifier = identifier;
  }

  /**
   * 订阅消息
   *
   * @param {Function} handler 回调函数
   * @param {ILevel} level 指定`level`
   */
  public subscribe(handler: MessageHubHandler, level?: ILevel) {
    if (level) {
      return this.sub$.pipe(filter((v) => v.level === level)).subscribe(handler);
    }
    return this.sub$.subscribe(handler);
  }

  /**
   * 发布消息
   *
   * @param message 消息
   */
  public publish(message: IMessage) {
    this.sub$.next(message);
  }

  public unsubscribe() {
    this.sub$.unsubscribe();
    MessageHubManager.delete(this.identifier);
  }
}

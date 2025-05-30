import { NonBlockingEventManager } from '@kunlun/shared';
import { ILevel } from '../types';
import { MessageHandler, MessageOptions } from './typing';

enum MessageLevel {
  ERROR = 1,
  WARN = 2,
  INFO = 4,
  SUCCESS = 8,
  DEBUG = 16
}

export class MessageManager extends NonBlockingEventManager<typeof ILevel> {
  protected currentMessageLevel: number | undefined;

  protected getCurrentMessageLevel(): number {
    let { currentMessageLevel } = this;
    if (!currentMessageLevel) {
      const level = process.env.MESSAGE_LEVEL || ILevel.SUCCESS;
      currentMessageLevel = MessageLevel[level];
      if (!currentMessageLevel || currentMessageLevel <= 0) {
        currentMessageLevel = MessageLevel.SUCCESS;
      }
      this.currentMessageLevel = currentMessageLevel;
    }
    return currentMessageLevel;
  }

  protected isNotify(level: ILevel) {
    return this.getCurrentMessageLevel() >= (MessageLevel[level] || 0);
  }

  public debug(message?: string, options?: MessageOptions): void {
    if (this.isNotify(ILevel.DEBUG)) {
      this.notifyHandler(ILevel.DEBUG, message, options);
    }
  }

  public info(message?: string, options?: MessageOptions): void {
    if (this.isNotify(ILevel.INFO)) {
      this.notifyHandler(ILevel.INFO, message, options);
    }
  }

  public warn(message?: string, options?: MessageOptions): void {
    if (this.isNotify(ILevel.WARN)) {
      this.notifyHandler(ILevel.WARN, message, options);
    }
  }

  public error(message?: string, options?: MessageOptions): void {
    if (this.isNotify(ILevel.ERROR)) {
      this.notifyHandler(ILevel.ERROR, message, options);
    }
  }

  public success(message?: string, options?: MessageOptions): void {
    if (this.isNotify(ILevel.SUCCESS)) {
      this.notifyHandler(ILevel.SUCCESS, message, options);
    }
  }

  public onDebug(fn: MessageHandler): void {
    this.on(ILevel.DEBUG, fn);
  }

  public onInfo(fn: MessageHandler): void {
    this.on(ILevel.INFO, fn);
  }

  public onWarn(fn: MessageHandler): void {
    this.on(ILevel.WARN, fn);
  }

  public onError(fn: MessageHandler): void {
    this.on(ILevel.ERROR, fn);
  }

  public onSuccess(fn: MessageHandler): void {
    this.on(ILevel.SUCCESS, fn);
  }

  public clearAll() {
    this.eventHandlerMap.clear();
  }
}

export const MessageHub = new MessageManager();

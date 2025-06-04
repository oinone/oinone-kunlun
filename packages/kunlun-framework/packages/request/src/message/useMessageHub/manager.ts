import { instantiate } from '@oinone/kunlun-shared';
import { IMessage } from '../../types';
import { IMessageHub, MessageHubConstructor } from '../typing';

export class InternalMessageHubManager {
  private messageHubConstructor: MessageHubConstructor | undefined;

  private messageHubs = new Map<string, IMessageHub>();

  public getMessageHubConstructor() {
    return this.messageHubConstructor;
  }

  public setMessageHubConstructor(constructor: MessageHubConstructor) {
    this.messageHubConstructor = constructor;
  }

  private generatorMessageHub(identifier: string): IMessageHub {
    const { messageHubConstructor } = this;
    if (!messageHubConstructor) {
      throw new Error('Invalid message hub constructor');
    }
    return instantiate(messageHubConstructor, identifier);
  }

  public get(identifier: string): IMessageHub | undefined {
    return this.messageHubs.get(identifier);
  }

  public delete(identifier: string) {
    this.messageHubs.delete(identifier);
  }

  public clearAll() {
    this.messageHubs.forEach((v) => {
      v.unsubscribe();
    });
    this.messageHubs.clear();
  }

  public register(identifier: string): IMessageHub {
    if (!identifier) {
      throw new Error('Please pass in required parameters');
    }
    const messageHub = this.generatorMessageHub(identifier);
    this.messageHubs.set(identifier, messageHub);
    return messageHub;
  }

  public publish(message: IMessage) {
    this.messageHubs.forEach((v) => {
      v.publish(message);
    });
  }
}

export const MessageHubManager = new InternalMessageHubManager();

import { Subscription } from '@kunlun/state';
import { ILevel, IMessage } from '../types';

export interface MessageOptions extends Record<string, unknown> {
  title?: string;
}

export type MessageHandler = (message?: string, options?: MessageOptions) => void;

export type MessageHubHandler = (result: IMessage) => void;

export interface IMessageHub {
  subscribe: (handler: MessageHubHandler, level?: ILevel) => Subscription;
  publish: (message: IMessage) => void;
  unsubscribe: () => void;
}

export type MessageHubConstructor = { new (identifier: string): IMessageHub };

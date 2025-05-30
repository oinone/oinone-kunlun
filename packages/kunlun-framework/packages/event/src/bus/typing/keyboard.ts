import { EventConsumerConfig, EventMessage } from './basic';

export interface KeyboardEventMessage extends EventMessage<KeyboardEvent> {
  code: string;
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
}

export type KeyboardKeys = '*' | string | string[];

export type KeyboardType = 'keypress' | 'keyup' | 'keydown';

export const KeyboardTypes: KeyboardType[] = ['keypress', 'keyup', 'keydown'];

export interface HTMLKeyboardEventConsumerConfig extends EventConsumerConfig {
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
}

import { HTMLElementEntity } from './util';

export interface GhostBody {
  sendEvent;
  originalEvent: DragEvent;
}

export interface MoveBody {
  dom: HTMLElement;
  clientRect: DOMRect;
  result: boolean | number | undefined | void;
}

export interface StartEvent {
  oldIndex: number;
}

export interface EndEvent {
  oldIndex: number;
  newIndex: number;
  from: HTMLElementEntity;
  to: HTMLElementEntity;
}

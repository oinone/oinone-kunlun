import { Component } from 'vue';

export interface DraggableStartEvent<T = unknown> {
  element: T;
  index: number;
}

export interface DraggableEndEvent<T = unknown> {
  fromComponent?: Component;
  oldElement: T;
  oldIndex: number;
  toComponent?: Component;
  newIndex: number;
}

export interface DraggableAddedEvent<T = unknown> {
  component?: Component;
  element: T;
  newIndex: number;
}

export interface DraggableMovedEvent<T = unknown> {
  component?: Component;
  element: T;
  oldIndex: number;
  newIndex: number;
}

export interface DraggableRemovedEvent<T = unknown> {
  component?: Component;
  element: T;
  oldIndex: number;
}

export interface DraggableSendEvent<T = unknown> {
  from: HTMLElement;
  to: HTMLElement;

  dragged: HTMLElement;
  draggedContext: {
    component?: Component;
    element: T;
    index: number;
  };

  related: HTMLElement;
  relatedContext: {
    component?: Component;
    element: T;
    index: number;
  };
}

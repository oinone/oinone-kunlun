export enum EventType {
  'create' = 'create',
  'replace' = 'replace',
  'delete' = 'delete'
}

export interface Event<T> {
  type: EventType;
  target: T;
}

export type Handler<T> = (e: Event<T>) => void;

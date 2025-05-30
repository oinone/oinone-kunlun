export enum EventCategory {
  html = 'html',
  keyboard = 'keyboard'
}

export type EventCategoryType = keyof typeof EventCategory | string;

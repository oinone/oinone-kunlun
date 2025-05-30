import { EventType, Handler } from './event';
import { ContextNode } from './typing';

export type Handlers<T> = Record<EventType, Set<Handler<T>>>;

export abstract class Manager<T extends ContextNode<T>> {
  private cache = new Map<string, T>();

  private handlers: Handlers<T>;

  protected constructor() {
    const handlers = {} as Handlers<T>;
    Object.keys(EventType).forEach((key) => (handlers[key] = new Set()));
    this.handlers = handlers;
  }

  public get(handle: string) {
    return this.cache.get(handle);
  }

  public createOrReplace(handle: string, parent?: T) {
    const node = this.generator(handle, parent);
    node.handle = handle;
    node.parentContext = parent;
    node.childrenContext = [];
    const parentChildren = parent?.childrenContext;
    if (parentChildren) {
      const index = parentChildren.findIndex((v) => v.handle === handle);
      if (index === -1) {
        parentChildren.push(node);
      } else {
        parentChildren.splice(index, 1, node);
      }
    }
    let eventType = EventType.create;
    if (this.cache.has(handle)) {
      eventType = EventType.replace;
    }
    this.cache.set(handle, node);
    this.handlers[eventType].forEach((fn) =>
      fn({
        type: eventType,
        target: node
      })
    );
    return node;
  }

  public delete(handle: string, deep = true): boolean {
    const target = this.get(handle);
    if (!target) {
      return false;
    }
    this.cache.delete(handle);
    this.handlers.delete.forEach((fn) =>
      fn({
        type: EventType.delete,
        target
      })
    );
    const parentChildren = target.parentContext?.childrenContext;
    if (parentChildren) {
      const index = parentChildren.findIndex((v) => v.handle === handle);
      if (index !== -1) {
        parentChildren.splice(index, 1);
      }
    }
    if (deep) {
      target.childrenContext.forEach((child) => {
        this.delete(child.handle);
      });
    }
    return true;
  }

  public keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  public forEach(callbackFn: (value: T, key: string, map: Map<string, T>) => void) {
    this.cache.forEach(callbackFn);
  }

  public onCreate(fn: Handler<T>) {
    this.hook(EventType.create, fn);
  }

  public onReplace(fn: Handler<T>) {
    this.hook(EventType.replace, fn);
  }

  public onDelete(fn: Handler<T>) {
    this.hook(EventType.delete, fn);
  }

  private hook(type: EventType, fn: Handler<T>) {
    this.handlers[type].add(fn);
  }

  protected abstract generator(handle: string, parent?: T): T;
}

export type Constructor<T extends object = object> = T | { new (...args): T };

export function instantiate<T extends object = object>(constructor: Constructor<T>, ...args): T {
  if (!constructor) {
    throw new Error('Invalid constructor');
  }
  let newInstance: T;
  if (typeof constructor === 'object') {
    newInstance = constructor;
  } else {
    newInstance = new (constructor.prototype?.constructor || constructor)(...args);
  }
  return newInstance;
}

import { postConstruct } from 'inversify';
import { ServiceNamed } from '../../typing';
import {
  isProxyConstructor,
  proxy,
  ProxyConstructor,
  ProxyNewableConstructor,
  proxyTargetConstructor
} from '../helper';

export function PostConstruct() {
  return <T extends Object, R>(target: T, propertyKey: string, descriptor: TypedPropertyDescriptor<R>) => {
    postConstruct()(target, propertyKey);
    return descriptor;
  };
}

export function InstantiatePostConstruct(): MethodDecorator {
  return <T extends Object, R>(target: T, propertyKey: ServiceNamed, descriptor: TypedPropertyDescriptor<R>) => {
    const fn = descriptor.value as Function | undefined;
    if (typeof fn !== 'function') {
      return;
    }
    proxyTargetConstructor(target, (constructor) => {
      let proxyFunction: ProxyConstructor;
      if (isProxyConstructor(constructor)) {
        proxyFunction = proxy(function InstantiateProperty(...args: unknown[]) {
          const object = (constructor as ProxyConstructor)(...args);
          fn.bind(object)();
          return object;
        });
      } else {
        proxyFunction = proxy(function InstantiateProperty(...args: unknown[]) {
          const object = new (constructor as ProxyNewableConstructor)(...args);
          fn.bind(object)();
          return object;
        });
      }
      return proxyFunction;
    });
  };
}

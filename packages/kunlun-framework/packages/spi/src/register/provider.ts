import { Container, injectable } from 'inversify';
import { SPIFactory, SPIToken } from '../operator';
import { SPIOptions } from '../typing';
import { definePriority } from './priority';
import { InjectionToken } from './typing';

export const container = new Container({ defaultScope: 'Singleton', skipBaseClassChecks: true });

export const DEFAULT_SCOPE = 'default';

interface ScopeConfig {
  name: string;
  order: number;
}

/**
 * 扩展名优先级最高
 * 默认优先级为 0，数字越大优先级越高
 */
export function Provide<T>(token: InjectionToken<T>, scope: string | ScopeConfig = DEFAULT_SCOPE) {
  return (target) => {
    injectable()(target);

    let scopeName: string = scope as string;
    let scopeOrder = 0;
    if (typeof scope !== 'string') {
      scopeName = scope.name || DEFAULT_SCOPE;
      scopeOrder = scope.order || 0;
    }

    definePriority(target, { order: scopeOrder });

    container.bind(token).to(target).whenTargetNamed(scopeName);

    return target;
  };
}

let factoryId = 0;

export function AutoFactory<T>(token: InjectionToken<T>, scope: string | ScopeConfig = DEFAULT_SCOPE) {
  return (target) => {
    injectable()(target);

    let scopeName: string = scope as string;
    let scopeOrder = 0;
    if (typeof scope !== 'string') {
      scopeName = scope.name || DEFAULT_SCOPE;
      scopeOrder = scope.order || 0;
    }

    definePriority(target, { order: scopeOrder });

    const autoToken = `__auto_container__${++factoryId}`;
    container.bind(autoToken).to(target);
    container.bind(token).toAutoFactory(autoToken).whenTargetNamed(scopeName);

    return target;
  };
}

export function Constructor<T>(token: InjectionToken<T>, scope: string | ScopeConfig = DEFAULT_SCOPE) {
  return (target) => {
    injectable()(target);

    let scopeName: string = scope as string;
    let scopeOrder = 0;
    if (typeof scope !== 'string') {
      scopeName = scope.name || DEFAULT_SCOPE;
      scopeOrder = scope.order || 0;
    }

    definePriority(target, { order: scopeOrder });

    container.bind(token).toConstructor(target).whenTargetNamed(scopeName);

    return target;
  };
}

export function ClassFactory<O extends SPIOptions = SPIOptions>(token: SPIToken<O> | undefined, replace = true) {
  return <T extends Object>(target: T) => {
    SPIFactory.Register(token, replace)(target);
  };
}

export function Factory<L, T>(
  token: InjectionToken<T>,
  factory: Function,
  scope: string | ScopeConfig = DEFAULT_SCOPE
) {
  return (Target: { new (...args): L }) => {
    injectable()(Target);
    let scopeName: string = scope as string;
    let scopeOrder = 0;
    if (typeof scope !== 'string') {
      scopeName = scope.name || DEFAULT_SCOPE;
      scopeOrder = scope.order || 0;
    }

    const target = (...args) => {
      return factory(Target, args);
    };
    definePriority(target, { order: scopeOrder });

    container.bind(token).toFactory<T>(target).whenTargetNamed(scopeName);
  };
}

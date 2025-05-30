import { ServiceIdentifier, ServiceNamed } from '../../typing';
import { container } from '../container';
import {
  isProxyConstructor,
  proxy,
  ProxyConstructor,
  ProxyNewableConstructor,
  proxyTargetConstructor
} from '../helper';
import { ServicePriorityManager } from './priority';

export function RawInstantiate<Interface>(
  token: ServiceIdentifier<Interface>,
  options?: { name?: ServiceNamed }
): Interface | undefined {
  const services = RawInstantiates0(token, options);
  if (!services || !services.length) {
    return undefined;
  }
  const index = ServicePriorityManager.getOptimalServiceBindingIndex(token, options?.name);
  if (index >= 0) {
    return services[index];
  }
  return services[services.length - 1];
}

export function RawInstantiates<Interface>(
  token: ServiceIdentifier<Interface>,
  options?: { name?: ServiceNamed }
): Interface[] {
  const services = RawInstantiates0(token, options);
  if (!services || !services.length) {
    return [];
  }
  const indexes = ServicePriorityManager.getOptimalServiceBindingIndexes(token, options?.name);
  const orderedServices: Interface[] = [];
  const unorderedServices: Interface[] = [];
  for (const index of indexes) {
    const service = services[index];
    if (!service) {
      console.error('Invalid service priority.');
      unorderedServices.push(service);
      continue;
    }
    orderedServices.push(service);
  }
  orderedServices.push(...unorderedServices);
  return orderedServices;
}

function RawInstantiates0<Interface>(
  token: ServiceIdentifier<Interface>,
  options?: { name?: ServiceNamed }
): Interface[] {
  try {
    const targetName = options?.name;
    if (targetName) {
      return container.getAllNamed(token, targetName);
    }
    return container.getAll(token);
  } catch (e) {
    console.error(e);
    return [];
  }
}

export function Instantiate<Interface>(token: ServiceIdentifier<Interface>, options?: { name?: ServiceNamed }) {
  return <T extends Object>(target: T, propertyKey: ServiceNamed, parameterIndex?: number) => {
    if (typeof parameterIndex === 'number') {
      proxyTargetConstructor(target, (constructor) =>
        InstantiateParameter(token, options, constructor, parameterIndex)
      );
    } else if (propertyKey) {
      proxyTargetConstructor(target, (constructor) => InstantiateProperty(token, options, constructor, propertyKey));
    }
  };
}

function InstantiateParameter<Interface>(
  token: ServiceIdentifier<Interface>,
  options: { name?: ServiceNamed } | undefined,
  constructor: ProxyConstructor | ProxyNewableConstructor,
  parameterIndex: number
): ProxyConstructor {
  let proxyFunction: ProxyConstructor;
  if (isProxyConstructor(constructor)) {
    proxyFunction = proxy(function InstantiateParameter(...args) {
      args[parameterIndex] = RawInstantiate(token, options);
      return (constructor as ProxyConstructor)(...args);
    });
  } else {
    proxyFunction = proxy(function InstantiateParameter(...args) {
      args[parameterIndex] = RawInstantiate(token, options);
      return new (constructor as ProxyNewableConstructor)(...args);
    });
  }
  return proxyFunction;
}

function InstantiateProperty<Interface>(
  token: ServiceIdentifier<Interface>,
  options: { name?: ServiceNamed } | undefined,
  constructor: ProxyConstructor | ProxyNewableConstructor,
  propertyKey: ServiceNamed
): ProxyConstructor {
  let proxyFunction: ProxyConstructor;
  if (isProxyConstructor(constructor)) {
    proxyFunction = proxy(function InstantiateProperty(...args) {
      const object = (constructor as ProxyConstructor)(...args);
      object[propertyKey] = RawInstantiate(token, options);
      return object;
    });
  } else {
    proxyFunction = proxy(function InstantiateProperty(...args) {
      const object = new (constructor as ProxyNewableConstructor)(...args);
      object[propertyKey] = RawInstantiate(token, options);
      return object;
    });
  }
  return proxyFunction;
}

export function Instantiates<Interface>(token: ServiceIdentifier<Interface>, options?: { name?: ServiceNamed }) {
  return <T extends Object>(target: T, propertyKey: ServiceNamed, parameterIndex?: number) => {
    if (typeof parameterIndex === 'number') {
      proxyTargetConstructor(target, (constructor) =>
        InstantiatesParameter(token, options, constructor, parameterIndex)
      );
    } else if (propertyKey) {
      proxyTargetConstructor(target, (constructor) => InstantiatesProperty(token, options, constructor, propertyKey));
    }
  };
}

function InstantiatesParameter<Interface>(
  token: ServiceIdentifier<Interface>,
  options: { name?: ServiceNamed } | undefined,
  constructor: ProxyConstructor | ProxyNewableConstructor,
  parameterIndex: number
): ProxyConstructor {
  let proxyFunction: ProxyConstructor;
  if (isProxyConstructor(constructor)) {
    proxyFunction = proxy(function InstantiateParameter(...args) {
      args[parameterIndex] = RawInstantiates(token, options);
      return (constructor as ProxyConstructor)(...args);
    });
  } else {
    proxyFunction = proxy(function InstantiateParameter(...args) {
      args[parameterIndex] = RawInstantiates(token, options);
      return new (constructor as ProxyNewableConstructor)(...args);
    });
  }
  return proxyFunction;
}

function InstantiatesProperty<Interface>(
  token: ServiceIdentifier<Interface>,
  options: { name?: ServiceNamed } | undefined,
  constructor: ProxyConstructor | ProxyNewableConstructor,
  propertyKey: ServiceNamed
): ProxyConstructor {
  let proxyFunction: ProxyConstructor;
  if (isProxyConstructor(constructor)) {
    proxyFunction = proxy(function InstantiateProperty(...args) {
      const object = (constructor as ProxyConstructor)(...args);
      object[propertyKey] = RawInstantiates(token, options);
      return object;
    });
  } else {
    proxyFunction = proxy(function InstantiateProperty(...args) {
      const object = new (constructor as ProxyNewableConstructor)(...args);
      object[propertyKey] = RawInstantiates(token, options);
      return object;
    });
  }
  return proxyFunction;
}

export type ProxyConstructor = Function & { __proxy__?: boolean };

export type ProxyNewableConstructor = (new (...args) => Object) & { __proxy__?: boolean };

export function isProxyConstructor(
  constructor: ProxyConstructor | ProxyNewableConstructor
): constructor is ProxyConstructor {
  return !!constructor.__proxy__;
}

export function proxy(fn: Function): ProxyConstructor {
  (fn as ProxyConstructor).__proxy__ = true;
  return fn;
}

export function proxyTargetConstructor(
  target: Object | ObjectConstructor,
  proxy: (constructor: ProxyConstructor | ProxyNewableConstructor) => ProxyConstructor
): void {
  let constructor = (target as ObjectConstructor).prototype?.constructor;
  const isPrototype = !!constructor;
  if (!isPrototype) {
    constructor = target.constructor;
  }
  if (typeof constructor !== 'function') {
    return;
  }
  const proxyConstructor = proxy(constructor);
  if (proxyConstructor) {
    if (isPrototype) {
      (target as ObjectConstructor).prototype.constructor = proxyConstructor;
    } else {
      target.constructor = proxyConstructor;
    }
  }
}

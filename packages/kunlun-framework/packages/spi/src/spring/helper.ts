type FunctionExtend = {
  __proxy_constructor__?: ProxyConstructor | ProxyNewableConstructor;
};

export type ProxyConstructor = Function & FunctionExtend;

export type ProxyNewableConstructor = (new (...args) => Object) & FunctionExtend;

export function isProxyConstructor(
  constructor: ProxyConstructor | ProxyNewableConstructor
): constructor is ProxyConstructor {
  return !!constructor.__proxy_constructor__;
}

export function proxyTargetConstructor(
  target: Object | ObjectConstructor,
  proxy: (constructor: ProxyConstructor | ProxyNewableConstructor) => ProxyConstructor
): void {
  let constructor: ProxyConstructor = (target as ObjectConstructor).prototype?.constructor;
  if (!constructor) {
    constructor = target.constructor;
  }
  constructor.__proxy_constructor__ = proxy(constructor.__proxy_constructor__ || constructor);
}

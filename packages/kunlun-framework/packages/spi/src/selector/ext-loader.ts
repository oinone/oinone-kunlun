import { getPriority, InjectionToken } from '../register';
import { container, DEFAULT_SCOPE } from '../register/provider';

/**
 * @deprecated since 5.0
 */
class Loader<T> {
  public constructor(public _token: InjectionToken<T>) {}

  // TODO: number 处理
  public getExt(name?: string | number | symbol): T {
    const bindings = container.getAllNamed(this._token, name || DEFAULT_SCOPE);
    return this.sortByPriority(bindings)[0];
  }

  public getHpExt(): T {
    const bindings = container.getAll(this._token);
    return this.sortByPriority(bindings)[0];
  }

  public getExts(): T[] {
    const bindings = container.getAll(this._token);
    return this.sortByPriority(bindings);
  }

  private sortByPriority(bindings: T[]): T[] {
    return bindings.sort((a, b) => {
      const orderA = getPriority(a as unknown as Function).order;
      const orderB = getPriority(b as unknown as Function).order;
      if (orderA === orderB) {
        return -1;
      }
      return orderB - orderA;
    });
  }
}

/**
 * @deprecated since 5.0
 */
class ExtLoader {
  public static getLoader<T>(token: InjectionToken<T>) {
    return new Loader<T>(token as InjectionToken<T> & { __order__: number });
  }

  public static getExt<T>(token: InjectionToken<T>, name?: string | number | symbol): T {
    return this.getLoader(token).getExt(name);
  }

  public static getExts<T>(token: InjectionToken<T>): T[] {
    return this.getLoader(token).getExts();
  }
}

export { ExtLoader };

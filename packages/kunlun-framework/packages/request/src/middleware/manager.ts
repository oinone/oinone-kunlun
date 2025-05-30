import { Constructor, instantiate } from '@kunlun/shared';
import { InterceptorOptions, NetworkInterceptor } from '../types';

type InternalInterceptors = Record<keyof InterceptorOptions, NetworkInterceptor>;

class InternalNetworkInterceptorManager {
  private interceptors: InternalInterceptors = {} as InternalInterceptors;

  public register(key: keyof InterceptorOptions, interceptor: Constructor<NetworkInterceptor> | null) {
    if (interceptor === undefined) {
      return;
    }
    let newInstance: NetworkInterceptor | null;
    if (interceptor === null) {
      newInstance = null;
      return;
    }
    newInstance = instantiate(interceptor);
    this.interceptors[key] = newInstance;
  }

  public getInterceptors(): Record<keyof InterceptorOptions, NetworkInterceptor> {
    return { ...this.interceptors };
  }
}

export const NetworkInterceptorManager = new InternalNetworkInterceptorManager();

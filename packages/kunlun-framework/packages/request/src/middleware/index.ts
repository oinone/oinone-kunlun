import { Constructor } from '@kunlun/shared';
import { InterceptorOptions, NetworkInterceptor } from '../types';
import {
  ActionRedirectInterceptor,
  LoginRedirectInterceptor,
  MessageHubInterceptor,
  NetworkErrorInterceptor,
  RequestErrorInterceptor,
  RequestSuccessInterceptor,
  TranslateInterceptor
} from './internal-interceptor';
import { NetworkInterceptorManager } from './manager';

function register(key: keyof InterceptorOptions, interceptor: Constructor<NetworkInterceptor>) {
  NetworkInterceptorManager.register(key, interceptor);
}

register('translate', TranslateInterceptor);
register('networkError', NetworkErrorInterceptor);
register('messageHub', MessageHubInterceptor);
register('requestSuccess', RequestSuccessInterceptor);
register('actionRedirect', ActionRedirectInterceptor);
register('loginRedirect', LoginRedirectInterceptor);
register('requestError', RequestErrorInterceptor);

export * from './internal-interceptor';

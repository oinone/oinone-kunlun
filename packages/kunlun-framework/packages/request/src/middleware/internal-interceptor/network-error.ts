import { MessageHub } from '../../message';
import { IResponseErrorResult, NetworkInterceptor } from '../../types';

export class NetworkErrorInterceptor implements NetworkInterceptor {
  public error(response: IResponseErrorResult) {
    const { networkError } = response;
    if (networkError) {
      const { name, message } = networkError;
      if (name && message) {
        if (message.includes('Unexpected token') || message.includes('is not valid JSON')) {
          const translate = Reflect.get(window, 'translate');
          const msg = '后端服务可能未启动或者正在启动中，请检查后端服务状态。';
          console.error(message);
          MessageHub.error((translate && translate(msg)) || msg);
        } else {
          MessageHub.error(message);
        }
      }
      return false;
    }
    return true;
  }
}

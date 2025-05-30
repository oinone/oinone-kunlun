import { MessageHub } from '../../message';
import { ILevel, IResponseResult, NetworkInterceptor } from '../../types';

export class RequestSuccessInterceptor implements NetworkInterceptor {
  public success(response: IResponseResult) {
    response.extensions?.messages?.forEach((v) => {
      const { level, message } = v;
      if (!level || !message) {
        console.warn('Invalid message', v);
        return;
      }
      switch (level) {
        case ILevel.DEBUG:
          MessageHub.debug(message);
          break;
        case ILevel.INFO:
          MessageHub.info(message);
          break;
        case ILevel.WARN:
          MessageHub.warn(message);
          break;
        case ILevel.ERROR:
          MessageHub.error(message);
          break;
        case ILevel.SUCCESS:
          MessageHub.success(message);
          break;
        default:
          console.warn('Invalid message level', v);
      }
    });
    return true;
  }
}

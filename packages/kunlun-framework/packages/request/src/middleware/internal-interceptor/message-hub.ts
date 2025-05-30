import { MessageHubManager } from '../../message';
import { ILevel, IResponseErrorResult, IResponseResult, NetworkInterceptor } from '../../types';

export class MessageHubInterceptor implements NetworkInterceptor {
  public success(response: IResponseResult) {
    const { extensions } = response;

    if (extensions && extensions.messages) {
      const msg = extensions.messages[0];

      if ([ILevel.SUCCESS, ILevel.DEBUG, ILevel.INFO, ILevel.WARN].includes(msg.level)) {
        MessageHubManager.publish(msg);
      }
    }
    return true;
  }

  public error(response: IResponseErrorResult) {
    const { errors, extensions } = response;

    let result = extensions?.messages?.[0];

    if (!result) {
      const errorMessage = errors?.[0];
      if (!errorMessage) {
        return true;
      }
      const { message, extensions: graphQLExtensions } = errorMessage;
      let extension = {} as any;
      if (graphQLExtensions && Object.keys(graphQLExtensions).length) {
        const { messages } = graphQLExtensions;

        if (messages && messages.length) {
          const { level, code, path, errorType, message: msg } = messages[0];
          extension = {
            level,
            errorCode: code,
            path,
            errorType,
            message: msg
          };
        } else {
          extension = {
            level: graphQLExtensions.level,
            errorCode: graphQLExtensions.errorCode,
            errorType: graphQLExtensions.errorType
          };
        }
      }

      result = {
        message,
        ...extension
      };
    }
    if (result && Object.keys(result).length) {
      MessageHubManager.publish(result);
    }
    return true;
  }
}

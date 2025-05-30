import { MessageHub } from '../../message';
import { notPermissionCodes, SystemErrorCode } from '../../permission';
import { IResponseErrorResult, NetworkInterceptor } from '../../types';

export class RequestErrorInterceptor implements NetworkInterceptor {
  public error(response: IResponseErrorResult) {
    const { errors } = response;

    if (errors && errors.length) {
      /**
       * 用来处理重复的错误提示
       */
      const executedMessages: string[] = [];

      for (const errorItem of errors) {
        const errorCode = errorItem.extensions?.errorCode || '';
        if (errorCode === SystemErrorCode.FORM_VALIDATE_ERROR || notPermissionCodes.includes(errorCode)) {
          continue;
        }
        const errorMessage = errorItem.extensions?.messages?.[0]?.message || errorItem.message;
        if (!executedMessages.includes(errorMessage)) {
          MessageHub.error(errorMessage);
        }
        executedMessages.push(errorMessage);
      }
    }
    return true;
  }
}

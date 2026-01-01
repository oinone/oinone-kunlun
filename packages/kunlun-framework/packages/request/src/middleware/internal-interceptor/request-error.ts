import { MessageHub } from '../../message';
import { notPermissionCodes, SystemErrorCode } from '../../permission';
import type { IMessage, IResponseErrorResult, NetworkInterceptor } from '../../types';

export class RequestErrorInterceptor implements NetworkInterceptor {
  public static ignoredFormValidateMessage(message: IMessage): boolean {
    return message.code === SystemErrorCode.FORM_VALIDATE_ERROR || !!message.field || !message.message;
  }

  public error(response: IResponseErrorResult) {
    const { errors } = response;

    if (errors && errors.length) {
      /**
       * 用来处理重复的错误提示
       */
      const executedMessages: string[] = [];

      for (const errorItem of errors) {
        const errorCode = errorItem.extensions?.errorCode || '';
        if (notPermissionCodes.includes(errorCode)) {
          continue;
        }
        if (errorCode === SystemErrorCode.FORM_VALIDATE_ERROR) {
          let isPush = false;
          for (const message of errorItem.extensions?.messages || []) {
            if (RequestErrorInterceptor.ignoredFormValidateMessage(message)) {
              continue;
            }
            const errorMessage = message.message;
            if (errorMessage && !executedMessages.includes(errorMessage)) {
              MessageHub.error(errorMessage);
              executedMessages.push(errorMessage);
              isPush = true;
            }
            if (!isPush) {
              const errorMessage = errorItem.message;
              if (errorMessage && !executedMessages.includes(errorMessage)) {
                MessageHub.error(errorMessage);
              }
            }
          }
        } else {
          const errorMessage = errorItem.extensions?.messages?.[0]?.message || errorItem.message;
          if (!executedMessages.includes(errorMessage)) {
            MessageHub.error(errorMessage);
            executedMessages.push(errorMessage);
          }
        }
      }
    }
    return true;
  }
}

import { HttpClientError, MessageHub, RequestErrorInterceptor, SystemErrorCode } from '@oinone/kunlun-request';

/**
 * 当后端抛出表单验证错误信息时，默认 MessageHub 不会提示任何内容，此时需要使用该方法处理错误信息，将错误内容展示在页面上
 * @param e 异常
 */
export function formValidateErrorProcess(e: HttpClientError): boolean {
  const error = e.errors?.[0];
  if (!error) {
    return false;
  }
  if (error.extensions?.errorCode !== SystemErrorCode.FORM_VALIDATE_ERROR) {
    return false;
  }
  for (const messageItem of error.extensions?.messages || []) {
    if (RequestErrorInterceptor.ignoredFormValidateMessage(messageItem)) {
      MessageHub.error(messageItem.message);
    }
  }
  return true;
}

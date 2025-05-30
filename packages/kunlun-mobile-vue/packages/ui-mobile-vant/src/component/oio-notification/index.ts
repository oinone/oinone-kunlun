import { OioNotificationOptions } from '@kunlun/vue-ui-common';
import { Toast, Notify } from 'vant';

export enum NotificationType {
  success = 'success',
  info = 'primary',
  warning = 'warning',
  error = 'danger'
}

class Message {
  public success(message) {
    Toast.success(message);
  }

  public info(message) {
    Toast(message);
  }

  public warning(message) {
    Toast.fail(message);
  }

  public error(message) {
    Toast.fail(message);
  }

  /**
   * 校验的错误提示，为了保障跟之前的版本样式一致
   * @param message
   */
  public validateTipError(message) {
    Toast.fail({
      duration: 3,
      message
    });
  }
}

class Notification {
  public open(type: NotificationType, message, description = '', options?: OioNotificationOptions) {
    Notify({
      type,
      message: `${message}${description ? `:${description}` : ''}`,
      duration: (options && options!.duration!) || 3000
    });
  }

  public success(message, description = '', options?: OioNotificationOptions) {
    this.open(NotificationType.success, message, description, options);
  }

  public info(message, description = '', options?: OioNotificationOptions) {
    this.open(NotificationType.info, message, description, options);
  }

  public warning(message, description = '', options?: OioNotificationOptions) {
    this.open(NotificationType.warning, message, description, options);
  }

  public error(message, description = '', options?: OioNotificationOptions) {
    this.open(NotificationType.error, message, description, options);
  }
}

export const notification = new Notification();
export const message = new Message();

export const OioNotification = new Notification();
export const OioMessage = new Message();

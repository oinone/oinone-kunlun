import { StringHelper } from '@kunlun/shared';
import { OioCloseIcon, OioIcon, OioNotificationOptions } from '@kunlun/vue-ui-common';
import { message as AMessage, notification as ANotification } from 'ant-design-vue';
import { createVNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

/**
 * 通知类型
 */
export enum NotificationType {
  /**
   * 提示
   */
  info = 'info',
  /**
   * 成功
   */
  success = 'success',
  /**
   * 警告
   */
  warning = 'warning',
  /**
   * 错误
   */
  error = 'error'
}

const getIconVNode = (icon: string, color: string, size = '21') =>
  createVNode(OioIcon, {
    icon,
    size,
    color
  });

const genNotificationIcon = (type: NotificationType, size = '21') => {
  switch (type) {
    case NotificationType.error:
      return getIconVNode('oinone-cuowu1', 'var(--oio-notification-error)', size);
    case NotificationType.info:
      return getIconVNode('oinone-tishi', 'var(--oio-notification-info)', size);

    case NotificationType.success:
      return getIconVNode('oinone-chenggong1', 'var(--oio-notification-success)', size);

    case NotificationType.warning:
      return getIconVNode('oinone-jinggao', 'var(--oio-notification-warning)', size);

    default:
      return '';
  }
};

/**
 * 消息提示
 */
class Message {
  /**
   * 根据指定类型打开相应的消息提示框
   * @param type 通知类型
   * @param message 消息内容
   * @param options 可选项
   */
  public open(type: NotificationType, message: string, options?: OioNotificationOptions) {
    AMessage[type]({
      ...(options || {}),
      content: message,
      icon: genNotificationIcon(type, '16'),
      duration: options?.duration || 3,
      class: StringHelper.append([`${DEFAULT_PREFIX}-message ${DEFAULT_PREFIX}-message-${type}`], options?.class).join(
        ' '
      )
    });
  }

  /**
   * 打开【提示】类型的消息提示框 {@link NotificationType.info}
   * @param message 消息内容
   * @param options 可选项
   */
  public info(message: string, options?: OioNotificationOptions) {
    this.open(NotificationType.info, message, options);
  }

  /**
   * 打开【成功】类型的消息提示框 {@link NotificationType.success}
   * @param message 消息内容
   * @param options 可选项
   */
  public success(message: string, options?: OioNotificationOptions) {
    this.open(NotificationType.success, message, options);
  }

  /**
   * 打开【警告】类型的消息提示框 {@link NotificationType.warning}
   * @param message 消息内容
   * @param options 可选项
   */
  public warning(message: string, options?: OioNotificationOptions) {
    this.open(NotificationType.warning, message, options);
  }

  /**
   * 打开【错误】类型的消息提示框 {@link NotificationType.error}
   * @param message 消息内容
   * @param options 可选项
   */
  public error(message: string, options?: OioNotificationOptions) {
    this.open(NotificationType.error, message, options);
  }
}

/**
 * 消息通知
 */
class Notification {
  /**
   * 根据指定类型打开相应的消息通知框
   * @param type 通知类型
   * @param title 消息标题
   * @param message 消息内容
   * @param options 可选项
   */
  public open(type: NotificationType, title: string, message?: string, options?: OioNotificationOptions) {
    ANotification[type]({
      ...(options || {}),
      message: title ? createVNode('div', { class: `${DEFAULT_PREFIX}-notification-message-title` }, title) : '',
      description: message,
      icon: genNotificationIcon(type),
      closeIcon: createVNode(OioCloseIcon, { volume: '16', size: '6' }),
      class: StringHelper.append(
        [`${DEFAULT_PREFIX}-notification ${DEFAULT_PREFIX}-notification-${type}`],
        options?.class
      ).join(' ')
    });
  }

  /**
   * 打开【提示】类型的消息通知框 {@link NotificationType.info}
   * @param title 消息标题
   * @param message 消息内容
   * @param options 可选项
   */
  public info(title: string, message?: string, options?: OioNotificationOptions) {
    this.open(NotificationType.info, title, message, options);
  }

  /**
   * 打开【成功】类型的消息通知框 {@link NotificationType.success}
   * @param title 消息标题
   * @param message 消息内容
   * @param options 可选项
   */
  public success(title: string, message?: string, options?: OioNotificationOptions) {
    this.open(NotificationType.success, title, message, options);
  }

  /**
   * 打开【警告】类型的消息通知框 {@link NotificationType.warning}
   * @param title 消息标题
   * @param message 消息内容
   * @param options 可选项
   */
  public warning(title: string, message?: string, options?: OioNotificationOptions) {
    this.open(NotificationType.warning, title, message, options);
  }

  /**
   * 打开【错误】类型的消息通知框 {@link NotificationType.error}
   * @param title 消息标题
   * @param message 消息内容
   * @param options 可选项
   */
  public error(title: string, message?: string, options?: OioNotificationOptions) {
    this.open(NotificationType.error, title, message, options);
  }
}

/**
 * 消息提示
 */
export const OioMessage = new Message();

/**
 * 消息通知
 */
export const OioNotification = new Notification();

/**
 * @deprecated 请使用{@link OioMessage}
 */
export const message = OioMessage;

/**
 * @deprecated 请使用{@link OioNotification}
 */
export const notification = OioNotification;

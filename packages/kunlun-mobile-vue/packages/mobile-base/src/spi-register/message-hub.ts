import { translate } from '@kunlun/engine';
import { MessageHub, MessageOptions } from '@kunlun/request';
import { NotificationType, OioNotification } from '@kunlun/vue-ui-mobile-vant';
import { get as getValue } from 'lodash-es';
import zh_CN from '../locale/zh_CN';

export function installMessageHub() {
  MessageHub.onDebug((message, options) => {
    OioNotification.info(options?.title || getNotificationTitle('debug'), message);
  });

  MessageHub.onInfo((message, options) => {
    notification(NotificationType.info, message, options);
  });

  MessageHub.onWarn((message, options) => {
    notification(NotificationType.warning, message, options);
  });

  MessageHub.onError((message, options) => {
    notification(NotificationType.error, message, options);
  });

  MessageHub.onSuccess((message, options) => {
    notification(NotificationType.success, message, options);
  });
}

function getNotificationTitle(type: string): string {
  // vant的NotificationType.error的值跟pc端的不一样
  type = type === 'danger' ? 'error' : type;
  const key = `kunlun.common.${type}`;
  return translate(key) || getValue(zh_CN, key);
}

function notification(type: NotificationType, message: string | undefined, options?: MessageOptions) {
  OioNotification.open(type, options?.title || getNotificationTitle(type), message);
}

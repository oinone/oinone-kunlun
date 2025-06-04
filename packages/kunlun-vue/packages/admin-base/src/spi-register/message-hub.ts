import { translateValueByKey } from '@oinone/kunlun-engine';
import { MessageHub, MessageOptions } from '@oinone/kunlun-request';
import { NotificationType, OioNotification } from '@oinone/kunlun-vue-ui-antd';
import { get as getValue } from 'lodash-es';
import zh_CN from '../locale/zh_CN';

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

let titleCache: Record<string, string> | undefined;

function getNotificationTitle(type: string): string {
  if (!titleCache) {
    titleCache = {};
    for (const item of typeof NotificationType) {
      const key = `kunlun.common.${type}`;
      titleCache[type] = translateValueByKey(getValue(zh_CN, key) as string);
    }
  }
  return titleCache[type] as string;
}

function notification(type: NotificationType, message: string | undefined, options?: MessageOptions) {
  OioNotification.open(type, options?.title || getNotificationTitle(type), message);
}

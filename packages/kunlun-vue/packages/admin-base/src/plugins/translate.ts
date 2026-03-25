import { translateValueByKey } from '@oinone/kunlun-engine';
import type { Plugin } from 'vue';

export const $translate: Plugin = {
  install: (app) => {
    app.config.globalProperties.$translate = (text: string, context?: Record<string, unknown>): string => {
      return translateValueByKey(text, context);
    };
  }
};

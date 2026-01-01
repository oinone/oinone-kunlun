import { translateValueByKey } from '@oinone/kunlun-engine';
import type { GenericType, StandardString } from '@oinone/kunlun-shared';
import type { Plugin } from 'vue';

export const $translate: Plugin = {
  install: (app) => {
    app.config.globalProperties.$translate = <T extends StandardString = StandardString>(text: T): T => {
      return translateValueByKey(text as unknown as GenericType<T>) as unknown as T;
    };
  }
};

import { translateValueByKey } from '@oinone/kunlun-engine';
import { StandardString } from '@oinone/kunlun-shared';
import { Plugin } from 'vue';

export const $translate: Plugin = {
  install: (app) => {
    app.config.globalProperties.$translate = <T extends StandardString = StandardString>(text: T): T => {
      return translateValueByKey(text as unknown as T) as unknown as T;
    };
  }
};

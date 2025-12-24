import { translateValueByKey } from '@oinone/kunlun-engine';
import { Plugin } from 'vue';

export const $translate: Plugin = {
  install: (app) => {
    app.config.globalProperties.$translate = <T extends string | null | undefined = string | null | undefined>(
      text: T
    ): T => translateValueByKey(text as string) as T;
  }
};

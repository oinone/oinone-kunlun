import { translateValueByKey } from '@oinone/kunlun-engine';
import { GenericReturnType, GenericType, StandardString } from '@oinone/kunlun-shared';
import { Plugin } from 'vue';

export const $translate: Plugin = {
  install: (app) => {
    app.config.globalProperties.$translate = <T extends StandardString>(
      text: GenericType<T>
    ): GenericReturnType<T, string> => {
      return translateValueByKey(text);
    };
  }
};

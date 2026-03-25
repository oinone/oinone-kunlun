import { translateValueByKey } from '@oinone/kunlun-engine';
import { GenericType } from '@oinone/kunlun-shared';
import type { Plugin } from 'vue';

export const $translate: Plugin = {
  install: (app) => {
    app.config.globalProperties.$translate = <T extends string | null | undefined = string | null | undefined>(
      text: T,
      context?: Record<string, unknown>
    ): T => {
      return translateValueByKey(text as unknown as GenericType<T>, context) as T;
    };
  }
};

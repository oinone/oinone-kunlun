import { InjectionKey } from 'vue';
import { InjectionToken } from '@oinone/kunlun-spi';

const __DEV__ = process.env.NODE_ENV === 'development';

export const genToken = <T>(name: string): InjectionKey<T> => {
  return InjectionToken<T>(__DEV__ ? `[vue-kunlun]: ${name}` : name) as any as InjectionKey<T>;
};

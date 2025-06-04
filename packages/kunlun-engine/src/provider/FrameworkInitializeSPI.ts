import { FrameworkInitializeOptions } from '@oinone/kunlun-environment';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPIFactory, SPIMultiSelector, SPIOperator, SPITokenFactory } from '@oinone/kunlun-spi';
import { OioProviderProps } from './typing';

export interface FrameworkInitializeService {
  before?(props: OioProviderProps): ReturnPromise<boolean | undefined | void>;

  after?(props: OioProviderProps): ReturnPromise<boolean | undefined | void>;
}

export type FrameworkInitializeType = FrameworkInitializeService | { new (): FrameworkInitializeService };

@SPIFactory.Storage(['framework', 'isMobile'], {
  selector: (storageKey): SPIMultiSelector<FrameworkInitializeOptions, FrameworkInitializeType> => {
    return (options) => {
      return SPIOperator.selectors<FrameworkInitializeType>(storageKey, options);
    };
  }
})
export class FrameworkInitializeSPI {
  public static Token: SPITokenFactory<FrameworkInitializeOptions>;

  public static Selector: SPIMultiSelector<FrameworkInitializeOptions, FrameworkInitializeType>;
}

export enum ClientType {
  pc = 'pc',
  mobile = 'mobile'
}

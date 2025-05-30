import {
  SPIFactory,
  SPIMatchAnyValue,
  SPIMultiSelectorNoOptions,
  SPIOperator,
  SPIOptions,
  SPITokenFactory
} from '@kunlun/spi';
import { VueWidget } from '@kunlun/vue-widget';
import { MobileSPIOptions } from '../basic/types';

type RootComponentType = VueWidget | { new (): VueWidget };

export interface RootComponentOptions extends MobileSPIOptions {
  widget: string;
}

@SPIFactory.Storage(['widget'], {
  selector: (storageKey): SPIMultiSelectorNoOptions<RootComponentType> => {
    return () => {
      return SPIOperator.selectors(storageKey, { widget: SPIMatchAnyValue });
    };
  }
})
export class RootComponentSPI {
  public static Token: SPITokenFactory<RootComponentOptions>;

  public static Selector: SPIMultiSelectorNoOptions<RootComponentType>;
}

import { StringHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { MobileMaskWidget } from '../basic';
import { BaseMaskLayoutWidget } from '../BaseMaskLayoutWidget';

@SPI.ClassFactory(MobileMaskWidget.Token({ dslNodeType: 'mask' }))
export class MaskRootWidget extends BaseMaskLayoutWidget {
  @Widget.Reactive()
  public get classNames(): string[] | undefined {
    return StringHelper.append(['k-m-layout-mask'], super.classNames);
  }
}

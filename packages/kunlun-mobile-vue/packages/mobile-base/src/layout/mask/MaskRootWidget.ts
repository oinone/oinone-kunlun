import { StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { MobileMaskWidget } from '../basic';
import { BaseMaskLayoutWidget } from '../BaseMaskLayoutWidget';

@SPI.ClassFactory(MobileMaskWidget.Token({ dslNodeType: 'mask' }))
export class MaskRootWidget extends BaseMaskLayoutWidget {
  @Widget.Reactive()
  public get classNames(): string[] | undefined {
    return StringHelper.append(['k-m-layout-mask'], super.classNames);
  }
}

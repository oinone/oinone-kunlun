import { StringHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { MaskWidget } from '../../../basic';
import { BaseMaskLayoutWidget } from '../BaseMaskLayoutWidget';

@SPI.ClassFactory(
  MaskWidget.Token({
    dslNodeType: 'block'
  })
)
export class MaskBlockWidget extends BaseMaskLayoutWidget {
  @Widget.Reactive()
  public get classNames(): string[] | undefined {
    return StringHelper.append(['k-layout-block'], super.classNames);
  }
}

import { StringHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { MaskWidget } from '../../../basic';
import { BaseMaskLayoutWidget } from '../BaseMaskLayoutWidget';

@SPI.ClassFactory(MaskWidget.Token({ dslNodeType: 'container' }))
export class MaskContainerWidget extends BaseMaskLayoutWidget {
  @Widget.Reactive()
  public get classNames(): string[] | undefined {
    return StringHelper.append(['k-layout-container', 'oio-scrollbar'], super.classNames);
  }
}

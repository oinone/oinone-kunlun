import { StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { MaskWidget } from '../../../basic';
import { BaseMaskLayoutWidget } from '../BaseMaskLayoutWidget';

enum Mode {
  horizontal = 'horizontal',
  inline = 'inline'
}

@SPI.ClassFactory(MaskWidget.Token({ dslNodeType: 'sidebar' }))
export class MaskSidebarWidget extends BaseMaskLayoutWidget {
  @Widget.Reactive()
  public get classNames(): string[] | undefined {
    const classNames = ['k-layout-sidebar'];
    if (this.mode === Mode.horizontal) {
      classNames.push('k-layout-sidebar-horizontal');
    }
    return StringHelper.append(classNames, super.classNames);
  }

  @Widget.Reactive()
  public get mode(): Mode {
    const { mode } = this.getDsl();
    if (Object.keys(Mode).includes(mode)) {
      return mode;
    }
    return Mode.inline;
  }
}

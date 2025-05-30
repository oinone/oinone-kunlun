import { Optional } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { RenderCellContext } from '@kunlun/vue-ui';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget, BaseTableColumnWidget } from '../../basic';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: ['radio-column', 'RadioColumn', 'radioColumn']
  })
)
export class TableRadioColumnWidget extends BaseTableColumnWidget {
  @Widget.Reactive()
  public get columnType() {
    return 'radio';
  }

  @Widget.Reactive()
  public get width() {
    return super.width || 52;
  }

  @Widget.Reactive()
  public get minWidth() {
    return super.minWidth || 52;
  }

  @Widget.Reactive()
  public className(context: RenderCellContext): string {
    return 'table-column-radio';
  }

  @Widget.Reactive()
  public headerClassName(context: RenderCellContext): string {
    return 'table-header-column-radio';
  }

  @Widget.Reactive()
  public get align() {
    return super.align || 'center';
  }

  @Widget.Reactive()
  public get fixed() {
    return Optional.ofNullable(super.fixed).orElse('left');
  }
}

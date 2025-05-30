import { Optional } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { RenderCellContext } from '../../ui';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget, BaseTableColumnWidget } from '../../basic';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: ['checkbox-column', 'CheckboxColumn', 'checkboxColumn']
  })
)
export class TableCheckboxColumnWidget extends BaseTableColumnWidget {
  @Widget.Reactive()
  public get columnType() {
    return 'checkbox';
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
    return 'table-column-checkbox';
  }

  @Widget.Reactive()
  public headerClassName(context: RenderCellContext): string {
    return 'table-header-column-checkbox';
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

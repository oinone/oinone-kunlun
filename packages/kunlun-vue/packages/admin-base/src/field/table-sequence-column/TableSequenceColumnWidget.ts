import { Optional } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { RenderCellContext } from '@kunlun/vue-ui';
import { Widget } from '@kunlun/vue-widget';
import { translateValueByKey } from '@kunlun/engine';
import { BaseElementWidget, BaseTableColumnWidget } from '../../basic';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: ['sequence-column', 'SequenceColumn', 'sequenceColumn']
  })
)
export class TableSequenceColumnWidget extends BaseTableColumnWidget {
  @Widget.Reactive()
  public get columnType() {
    return 'seq';
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
    return 'table-column-sequence';
  }

  @Widget.Reactive()
  public headerClassName(context: RenderCellContext): string {
    return 'table-header-column-sequence';
  }

  @Widget.Reactive()
  public get label() {
    return super.label || translateValueByKey('序号');
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

import { translateValueByKey } from '@oinone/kunlun-engine';
import { Optional, StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import type { RenderCellContext } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
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
  public className(context: RenderCellContext): string[] {
    return StringHelper.append(['table-column-sequence'], super.className(context));
  }

  @Widget.Reactive()
  public headerClassName(context: RenderCellContext): string[] {
    return StringHelper.append(['table-header-column-sequence'], super.headerClassName(context));
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

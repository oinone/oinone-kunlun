import { StringHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { RenderCellContext } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget, BaseTableColumnWidget } from '../../basic';
import DefaultColgroupColumn from './DefaultColgroupColumn.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: ['colgroup']
  })
)
export class TableColgroupColumnWidget extends BaseTableColumnWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultColgroupColumn);
    return this;
  }

  @Widget.Method()
  public className(context: RenderCellContext): string[] {
    return StringHelper.append(['table-column-colgroup'], super.className(context));
  }

  @Widget.Method()
  public headerClassName(context: RenderCellContext): string[] {
    return StringHelper.append(['table-header-column-colgroup'], super.headerClassName(context));
  }
}

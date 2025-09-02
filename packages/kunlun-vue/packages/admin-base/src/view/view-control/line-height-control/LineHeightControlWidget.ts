import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
import DefaultLineHeightControl from './DefaultLineHeightControl.vue';
import { TableLineHeightEnum } from '../../../typing';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'LineHeightControl'
  })
)
export class LineHeightControlWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultLineHeightControl);
    return this;
  }

  /**
   * 当前行高类型
   * @see {@link BaseTableWidget}
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected lineHeightType: TableLineHeightEnum | undefined;

  /**
   * 修改行高类型
   * @see {@link BaseTableWidget}
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected setLineHeightType!: (value: TableLineHeightEnum) => void;
}

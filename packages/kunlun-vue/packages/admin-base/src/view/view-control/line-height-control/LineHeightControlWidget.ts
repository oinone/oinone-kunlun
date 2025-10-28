import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
import { TableLineHeightEnum } from '../../../typing';
import DefaultLineHeightControl from './DefaultLineHeightControl.vue';

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
  protected get lineHeightType(): TableLineHeightEnum | undefined {
    return this.viewState?.lineHeightType as TableLineHeightEnum | undefined;
  }

  /**
   * 修改行高类型
   * @see {@link BaseTableWidget}
   */
  @Widget.Reactive()
  protected setLineHeightType(value: TableLineHeightEnum): void {
    const { viewState } = this;
    if (viewState) {
      viewState.lineHeightType = value;
    }
  }
}

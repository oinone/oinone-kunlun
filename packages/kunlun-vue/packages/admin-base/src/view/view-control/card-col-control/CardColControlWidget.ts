import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../basic';
import DefaultCardColControl from './DefaultCardColControl.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    widget: 'CardColControl'
  })
)
export class CardColControlWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultCardColControl);
    return this;
  }

  /**
   * 一行几列（设计器配置）
   * @see {@link GalleryWidget}
   */
  @Widget.Reactive()
  @Widget.Inject()
  protected cols!: number;

  /**
   * 设置一行几列
   * @see {@link GalleryWidget}
   */
  @Widget.Method()
  @Widget.Inject()
  public setCardCols!: (cols: number) => void;
}

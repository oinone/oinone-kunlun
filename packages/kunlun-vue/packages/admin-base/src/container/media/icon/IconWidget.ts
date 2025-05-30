import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../basic';
import DefaultIcon from './DefaultIcon.vue';

/**
 * 与字段无关的media组件-段落
 */
@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'icon' }))
export class IconWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultIcon);
    return this;
  }

  @Widget.Reactive()
  protected get icon() {
    return this.getDsl().icon;
  }

  @Widget.Reactive()
  protected get color() {
    return this.getDsl().color;
  }

  @Widget.Reactive()
  protected get size() {
    return this.getDsl().size;
  }
}

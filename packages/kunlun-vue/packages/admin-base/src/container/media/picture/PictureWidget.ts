import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../basic';
import DefaultPicture from './DefaultPicture.vue';

/**
 * 与字段无关的media组件-段落
 */
@SPI.ClassFactory(BaseElementWidget.Token({ widget: 'picture' }))
export class PictureWidget extends BaseElementWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultPicture);
    return this;
  }

  @Widget.Reactive()
  protected get url() {
    if (this.getDsl().url) {
      return this.getDsl().url;
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get width() {
    const realWidth = this.getDsl().width;
    if (realWidth) {
      return `${realWidth}px`;
    }
    return realWidth;
  }

  @Widget.Reactive()
  protected get height() {
    const realHeight = this.getDsl().height;
    if (realHeight) {
      return `${realHeight}px`;
    }
    return realHeight;
  }
}

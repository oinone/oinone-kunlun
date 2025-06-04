import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';

import GalleryTagString from './GalleryTagString.vue';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringWidget } from '../../../detail';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    widget: 'TagString',
    ttype: [ModelFieldType.String, ModelFieldType.Phone, ModelFieldType.Email]
  })
)
export class GalleryTagStringWidget extends DetailStringWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryTagString);
    return this;
  }

  /**
   * @description bgColor 背景色
   * @description iconColor icon颜色
   * @description icon 展示icon
   * @description textColor 文字颜色
   * @description showText icon和文字是否同时展示
   * */
  @Widget.Reactive()
  protected get optConfig() {
    const { bgColor = 'red', textColor = 'blue' } = this.getDsl();
    return {
      bgColor,
      textColor
    };
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

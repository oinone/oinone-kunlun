import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringFieldWidget } from '../../../detail';

import GalleryTagString from './GalleryTagString.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.String, ModelFieldType.Phone, ModelFieldType.Email],
    widget: 'TagString'
  })
)
export class GalleryStringTagStringFieldWidget extends DetailStringFieldWidget {
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
  private get optConfig() {
    const { bgColor = 'red', textColor = 'blue' } = this.getDsl();
    return {
      bgColor,
      textColor
    };
  }
}

/**
 * @deprecated please using GalleryStringTagFieldWidget
 */
export const GalleryTagStringWidget = GalleryStringTagStringFieldWidget;

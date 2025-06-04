import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DetailEnumFieldWidget } from '../../../detail';

import GalleryTagEnum from './GalleryTagEnum.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: ModelFieldType.Enum,
    widget: ['Tag', 'TagEnum']
  })
)
export class GalleryEnumTagFieldWidget extends DetailEnumFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryTagEnum);
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
    const option = this.options.find((opt) => opt.value === this.value);
    return option || {};
  }

  @Widget.Reactive()
  protected get displayName() {
    const findOption = this.options.find((item) => item.value === this.value);
    return findOption ? findOption.label : null;
  }
}

/**
 * @deprecated please using GalleryEnumTagEnumFieldWidget
 */
export const GalleryTagEnumWidget = GalleryEnumTagFieldWidget;

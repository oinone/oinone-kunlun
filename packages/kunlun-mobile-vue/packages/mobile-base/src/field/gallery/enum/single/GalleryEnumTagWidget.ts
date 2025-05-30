import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';

import GalleryTagEnum from './GalleryTagEnum.vue';
import { DetailEnumFieldWidget } from '../../../detail';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    widget: 'TagEnum',
    ttype: ModelFieldType.Enum,
    multi: false
  })
)
export class GalleryTagEnumWidget extends DetailEnumFieldWidget {
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
  protected get optConfig() {
    const option = this.options.find((opt) => opt.value === this.value);
    return option || {};
  }

  @Widget.Reactive()
  protected get displayName() {
    const findOption = this.options.find((item) => item.value === this.value);
    return findOption ? findOption.label : null;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

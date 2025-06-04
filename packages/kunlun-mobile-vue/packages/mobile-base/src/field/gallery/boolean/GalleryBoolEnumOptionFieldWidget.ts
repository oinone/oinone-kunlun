import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic/field';
import { DetailBoolEnumOptionFieldWidget } from '../../detail';
import GalleryEnum from '../enum/GalleryEnum.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.Boolean],
    widget: ['Select', 'Radio']
  })
)
export class GalleryBoolEnumOptionFieldWidget extends DetailBoolEnumOptionFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryEnum);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

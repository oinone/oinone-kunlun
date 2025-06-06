import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic/field';
import { DetailNumberWidget } from '../../detail';
import GalleryString from '../string/default/GalleryString.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    multi: false,
    ttype: [ModelFieldType.Integer, ModelFieldType.Long, ModelFieldType.Float, ModelFieldType.Currency]
  })
)
export class GalleryNumberWidget extends DetailNumberWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryString);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

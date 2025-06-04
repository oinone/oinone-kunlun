import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import { DetailYearFieldWidget } from '../../detail';
import ReadonlyDateTimePicker from './ReadonlyDateTimePicker.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: ModelFieldType.Year
  })
)
export class GalleryYearFieldWidget extends DetailYearFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ReadonlyDateTimePicker);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

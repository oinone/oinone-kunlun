import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { BaseElementWidget } from '../../../../basic';
import { DetailDateTimeRangeFieldWidget } from '../../../detail';
import ReadonlyDateTimeRangePicker from './ReadonlyDateTimeRangePicker.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: 'DateTimeRangePicker'
  })
)
export class GalleryDateTimeRangeFieldWidget extends DetailDateTimeRangeFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ReadonlyDateTimeRangePicker);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

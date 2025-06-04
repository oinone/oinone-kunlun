import { ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseElementWidget } from '../../../../basic';
import { DetailDateRangeFieldWidget } from '../../../detail';
import ReadonlyDateTimeRangePicker from './ReadonlyDateTimeRangePicker.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: 'DateRangePicker'
  })
)
export class GalleryDateRangeFieldWidget extends DetailDateRangeFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ReadonlyDateTimeRangePicker);
    return this;
  }
}

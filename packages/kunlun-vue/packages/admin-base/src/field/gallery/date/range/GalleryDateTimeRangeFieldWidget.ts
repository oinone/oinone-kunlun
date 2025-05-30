import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
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
}

import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseElementWidget } from '../../../../basic';
import { DetailTimeRangeFieldWidget } from '../../../detail';
import ReadonlyDateTimeRangePicker from './ReadonlyDateTimeRangePicker.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: 'TimeRangePicker'
  })
)
export class GalleryTimeRangeFieldWidget extends DetailTimeRangeFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ReadonlyDateTimeRangePicker);
    return this;
  }
}

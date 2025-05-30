import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseElementWidget } from '../../../../basic';
import { DetailYearRangeFieldWidget } from '../../../detail';
import ReadonlyDateTimeRangePicker from './ReadonlyDateTimeRangePicker.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Gallery,
    widget: 'YearRangePicker'
  })
)
export class GalleryYearRangeFieldWidget extends DetailYearRangeFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(ReadonlyDateTimeRangePicker);
    return this;
  }
}

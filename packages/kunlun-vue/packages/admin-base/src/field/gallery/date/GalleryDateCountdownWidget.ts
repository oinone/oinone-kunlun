import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { DefaultCountdown } from '../../../components';
import { GalleryDateFieldWidget } from './GalleryDateFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: ModelFieldType.Date,
    widget: 'DateCountdown'
  })
)
export class GalleryDateCountdownWidget extends GalleryDateFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultCountdown);
    return this;
  }
}

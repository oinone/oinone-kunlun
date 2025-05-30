import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import { DefaultCountdown } from '../../../components';
import { GalleryDateTimeFieldWidget } from './GalleryDateTimeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: ModelFieldType.DateTime,
    widget: 'DateTimeCountdown'
  })
)
export class GalleryDateTimeCountdownWidget extends GalleryDateTimeFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultCountdown);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

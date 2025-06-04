import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import { DetailHtmlFieldWidget } from '../../detail';
import Html from './Html.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: ModelFieldType.HTML
  })
)
export class GalleryHtmlFieldWidget extends DetailHtmlFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Html);
    return this;
  }

  @Widget.Reactive()
  public get showHeight() {
    return this.getDsl()?.showHeight;
  }
}

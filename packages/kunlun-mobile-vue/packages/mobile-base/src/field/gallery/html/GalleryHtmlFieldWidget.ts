import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';

import { FormFieldWidget } from '../../../basic/field';
import Html from './Html.vue';
import { DetailHtmlFieldWidget } from '../../detail';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: [ViewType.Gallery], ttype: ModelFieldType.HTML }))
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

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

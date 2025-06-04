import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../../basic';
import { DetailStringIframeFieldWidget } from '../../../detail';
import Iframe from './Iframe.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: ModelFieldType.String,
    widget: ['Iframe']
  })
)
export class GalleryStringIframeFieldWidget extends DetailStringIframeFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Iframe);
    return this;
  }
}

/**
 * @deprecated please using GalleryStringIframeFieldWidget
 */
export const GalleryIframeWidget = GalleryStringIframeFieldWidget;

import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringFieldWidget } from '../../../detail';

import GalleryString from './GalleryString.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.String, ModelFieldType.Phone, ModelFieldType.Email]
  })
)
export class GalleryStringFieldWidget extends DetailStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryString);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

/**
 * please using GalleryStringFieldWidget
 */
export const GalleryStringWidget = GalleryStringFieldWidget;

import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';

import { GalleryNumberWidget } from '../../number';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.Integer, ModelFieldType.ID, ModelFieldType.Float],
    multi: false,
    widget: 'TextContent'
  })
)
export class GalleryNumberTextContentWidget extends GalleryNumberWidget {
  @Widget.Reactive()
  protected get valueColor() {
    return this.getDsl().valueColor;
  }

  @Widget.Reactive()
  protected get valueFontSize() {
    const size = this.getDsl().valueFontSize;
    if (size) {
      return `${size}px`;
    }
    return 'var(--oio-font-size)';
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';

import { GalleryStringFieldWidget } from '../../string';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.String],
    multi: false,
    widget: 'TextContent'
  })
)
export class GalleryStringTextContentWidget extends GalleryStringFieldWidget {
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
}

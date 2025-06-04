import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';

import { GalleryStringWidget } from '../../string';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.String],
    multi: false,
    widget: 'TextContent'
  })
)
export class GalleryStringTextContentWidget extends GalleryStringWidget {
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

import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringTagFieldWidget } from '../../../detail';
import GalleryTag from './GalleryTag.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.String, ModelFieldType.Integer],
    multi: true
  })
)
export class GalleryStringTagFieldWidget extends DetailStringTagFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(GalleryTag);
    return this;
  }

  @Widget.Reactive()
  protected get displayNameList() {
    const tags: { label: string }[] = [];
    if (this.value && this.value.length) {
      for (let i = 0; i < this.value.length; i++) {
        tags.push({
          label: this.value[i]
        });
      }
    }
    return tags;
  }
}

/**
 * @deprecated please using GalleryStringTagFieldWidget
 */
export const GalleryStringTagWidget = GalleryStringTagFieldWidget;

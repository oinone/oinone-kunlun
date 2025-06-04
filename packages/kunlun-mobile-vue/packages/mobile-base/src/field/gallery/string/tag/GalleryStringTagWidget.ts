import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringTagWidget } from '../../../detail';
import GalleryTag from './GalleryTag.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Gallery],
    ttype: [ModelFieldType.String, ModelFieldType.Integer],
    multi: true
  })
)
export class GalleryStringTagWidget extends DetailStringTagWidget {
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

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

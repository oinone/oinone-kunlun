import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringUploadImgWidget } from '../../../detail';
import ReadonlyUploadImg from './ReadonlyUploadImg.vue';
import { Widget } from '@kunlun/vue-widget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: ModelFieldType.String,
    widget: 'UploadImg'
  })
)
export class GalleryUploadImgStringFieldWidget extends DetailStringUploadImgWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(ReadonlyUploadImg);
    return this;
  }

  @Widget.Reactive()
  protected get justifyContent() {
    return this.getDsl().justifyContent;
  }
}

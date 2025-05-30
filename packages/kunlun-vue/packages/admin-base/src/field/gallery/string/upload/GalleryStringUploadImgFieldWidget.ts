import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { DetailStringUploadImgFieldWidget } from '../../../detail';
import ReadonlyUploadImg from './ReadonlyUploadImg.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Gallery,
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: 'UploadImg'
  })
)
export class GalleryStringUploadImgFieldWidget extends DetailStringUploadImgFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(ReadonlyUploadImg);
    return this;
  }
}

/**
 * @deprecated please using GalleryStringUploadImgFieldWidget
 */
export const GalleryUploadImgStringFieldWidget = GalleryStringUploadImgFieldWidget;

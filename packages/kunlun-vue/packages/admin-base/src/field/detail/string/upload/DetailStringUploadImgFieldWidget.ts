import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import ReadonlyUploadImg from './ReadonlyUploadImg.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: [ModelFieldType.String, ModelFieldType.Text],
    widget: ['UploadImg']
  })
)
export class DetailStringUploadImgFieldWidget extends FormFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(ReadonlyUploadImg);
    return this;
  }
}

/**
 * @deprecated please using DetailStringUploadImgFieldWidget
 */
export const DetailStringUploadImgWidget = DetailStringUploadImgFieldWidget;

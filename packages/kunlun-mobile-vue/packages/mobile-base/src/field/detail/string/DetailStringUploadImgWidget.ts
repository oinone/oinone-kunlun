import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic/field';
import ReadonlyUploadImg from './ReadonlyUploadImg.vue';
import { Widget } from '@kunlun/vue-widget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.String,
    widget: ['UploadImg']
  })
)
export class DetailStringUploadImgWidget extends FormFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(ReadonlyUploadImg);
    return this;
  }

  @Widget.Reactive()
  public get isAutoHeight() {
    return true;
  }
}

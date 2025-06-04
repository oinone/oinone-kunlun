import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic/field';
import ReadonlyUpload from './ReadonlyUpload.vue';
import { Widget } from '@oinone/kunlun-vue-widget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.String,
    widget: ['Upload']
  })
)
export class DetailStringUploadWidget extends FormFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(ReadonlyUpload);
    return this;
  }

  @Widget.Reactive()
  public get isAutoHeight() {
    return true;
  }
}

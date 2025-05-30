import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseFieldWidget } from '../../../../basic';
import { UploadImgCom } from '../../../../components';
import { FormStringUploadFieldWidget } from './FormStringUploadFieldWidget';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: [ViewType.Form],
    ttype: ModelFieldType.String,
    widget: ['UploadImg']
  })
)
export class FormStringUploadImgFieldWdiget extends FormStringUploadFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadImgCom);
    return this;
  }

  @Widget.Reactive()
  public get fakeVertical() {
    return true;
  }
}

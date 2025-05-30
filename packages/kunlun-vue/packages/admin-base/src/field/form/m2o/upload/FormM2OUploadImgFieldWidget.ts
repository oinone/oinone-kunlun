import { ModelFieldType, ViewType } from '@kunlun/meta';
import { BooleanHelper } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { isBoolean, isNil, isString } from 'lodash-es';
import { FormFieldWidget } from '../../../../basic';
import { UploadImgCom } from '../../../../components';
import { AbstractFormM2OUploadFieldWidget } from './AbstractFormM2OUploadFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: ModelFieldType.ManyToOne,
    widget: ['UploadImg']
  })
)
export class FormM2OUploadImgFieldWidget extends AbstractFormM2OUploadFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadImgCom);
    return this;
  }

  @Widget.Method()
  protected getImportFile(data) {
    this.change((data && data[0]) || null);
  }

  @Widget.Method()
  public change(v) {
    const value = Array.isArray(v) ? v[0] || null : {};
    super.change(value);

    this.blur();
  }

  @Widget.Method()
  protected remove(file) {
    if (file) {
      this.change(null as any);

      this.blur();
    }
  }

  @Widget.Reactive()
  protected get showPreviewTitle() {
    let { showPreviewTitle } = this.getDsl();
    if (isNil(showPreviewTitle)) {
      showPreviewTitle = true;
    }
    if (isBoolean(showPreviewTitle)) {
      return showPreviewTitle;
    }
    if (isString(showPreviewTitle)) {
      if (BooleanHelper.isStringBoolean(showPreviewTitle)) {
        return !!BooleanHelper.toBoolean(showPreviewTitle);
      }
    }
    return false;
  }
}

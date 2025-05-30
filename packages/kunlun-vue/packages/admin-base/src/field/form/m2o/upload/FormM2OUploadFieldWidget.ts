import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { UploadCom } from '../../../../components';
import { AbstractFormM2OUploadFieldWidget } from './AbstractFormM2OUploadFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail, ViewType.Gallery, ViewType.Table],
    ttype: ModelFieldType.ManyToOne,
    widget: ['Upload']
  })
)
export class FormM2OUploadFieldWidget extends AbstractFormM2OUploadFieldWidget {
  public initialize(config) {
    super.initialize(config);
    this.setComponent(UploadCom);
    return this;
  }

  @Widget.Method()
  protected getImportFile(data) {
    this.change((data && data[0]) || null);
  }

  @Widget.Method()
  public change(value) {
    let finalValue = value;
    if (Array.isArray(finalValue)) {
      finalValue = finalValue?.[0];
    }
    super.change(finalValue);
  }

  @Widget.Method()
  protected remove(file) {
    if (file) {
      this.change(null as any);
    }
  }

  @Widget.Method()
  protected drop(e) {
    if (e) {
      console.log('draggable drop', e);
    }
  }
}

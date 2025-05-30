import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { DEFAULT_PREDEFINE } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { isArray, isString } from 'lodash-es';

import { FormFieldWidget } from '../../../../basic';
import DefaultColorPicker from './DefaultColorPicker.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.String,
    widget: 'ColorPicker'
  })
)
export class FormColorPickerStringFieldWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultColorPicker);
    return this;
  }

  @Widget.Reactive()
  protected get predefine() {
    const { predefine } = this.getDsl();
    if (predefine) {
      try {
        const result = JSON.parse(predefine);
        const finalResult: string[] = [];
        if (isArray(result)) {
          result.forEach((item) => {
            if (isString(item)) {
              finalResult.push(item);
            }
          });
        }
        return finalResult;
      } catch (e) {
        console.error('predefine error.', e);
      }
    }
    return DEFAULT_PREDEFINE;
  }

  @Widget.Reactive()
  public change(v) {
    super.change(v);
    this.blur();
  }

  @Widget.Reactive()
  public get isLink() {
    return true;
  }
}

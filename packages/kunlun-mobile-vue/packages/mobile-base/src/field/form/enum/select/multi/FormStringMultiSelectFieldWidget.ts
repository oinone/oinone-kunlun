import { RuntimeEnumerationOption } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { isNil } from 'lodash-es';
import { FormFieldWidget } from '../../../../../basic';
import { FormMultiEnumFieldWidget } from './FormMultiEnumFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.String,
    widget: 'Select',
    multi: true
  })
)
export class FormStringMultiSelectFieldWidget extends FormMultiEnumFieldWidget {
  protected handleOptions(ops: RuntimeEnumerationOption[]) {
    if (!ops || !ops.length) {
      return [];
    }
    const realOptions: RuntimeEnumerationOption[] = [];
    ops.forEach((_o) => {
      _o.label = _o.displayName;
      if (isNil(_o.value)) {
        _o.value = _o.name;
      }
      realOptions.push(_o);
    });
    return realOptions;
  }
}

import { RuntimeEnumerationOption } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { isNil } from 'lodash-es';
import { FormFieldWidget } from '../../../../../basic';
import { FormEnumMultiSelectFieldWidget } from './FormEnumMultiSelectFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.String,
    widget: 'Select',
    multi: true
  })
)
export class FormStringMultiSelectFieldWidget extends FormEnumMultiSelectFieldWidget {
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

import { IModelFieldOption, ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { isNil } from 'lodash-es';
import { FormFieldWidget } from '../../../../../basic';
import { FormEnumFieldWidget } from './FormEnumFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.String,
    widget: 'Select'
  })
)
export class FormStringSelectFieldWidget extends FormEnumFieldWidget {
  protected handleOptions(ops: IModelFieldOption[]) {
    if (!ops || !ops.length) {
      return [];
    }
    const realOptions = [] as IModelFieldOption[];
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

import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { FormO2MFieldSelectWidget } from './FormO2MFieldSelectWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.OneToMany,
    widget: 'SelectAll'
  })
)
export class FormO2MFieldSelectAllWidget extends FormO2MFieldSelectWidget {
  protected pageSize = -1;
}

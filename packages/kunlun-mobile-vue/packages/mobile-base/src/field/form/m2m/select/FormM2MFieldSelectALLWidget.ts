import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { FormM2MFieldSelectWidget } from './FormM2MFieldSelectWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.ManyToMany,
    widget: 'SelectAll'
  })
)
export class FormM2MFieldSelectAllWidget extends FormM2MFieldSelectWidget {
  protected pageSize = -1;
}

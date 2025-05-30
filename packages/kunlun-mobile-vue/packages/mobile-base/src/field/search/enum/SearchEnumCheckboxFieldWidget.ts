import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { FormMultiEnumCheckboxWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Enum,
    widget: 'Checkbox'
  })
)
export class SearchEnumCheckboxFieldWidget extends FormMultiEnumCheckboxWidget {}

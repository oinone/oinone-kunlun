import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormMultiEnumFieldWidget } from '../../form';
import { FormFieldWidget } from '../../../basic';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: [ModelFieldType.Enum],
    multi: false,
    widget: 'MultiSelect'
  })
)
export class SearchEnumMultiSelectFieldWidget extends FormMultiEnumFieldWidget {}

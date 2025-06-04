import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

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

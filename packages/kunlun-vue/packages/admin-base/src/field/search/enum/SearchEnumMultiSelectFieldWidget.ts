import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { FormEnumMultiSelectFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Enum,
    widget: 'MultiSelect'
  })
)
export class SearchEnumMultiSelectFieldWidget extends FormEnumMultiSelectFieldWidget {}

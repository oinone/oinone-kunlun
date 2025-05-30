import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
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

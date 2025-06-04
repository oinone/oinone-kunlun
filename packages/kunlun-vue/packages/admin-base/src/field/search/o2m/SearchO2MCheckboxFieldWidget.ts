import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { FormO2MCheckboxFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.OneToMany,
    widget: 'Checkbox'
  })
)
export class SearchO2MCheckboxFieldWidget extends FormO2MCheckboxFieldWidget {}

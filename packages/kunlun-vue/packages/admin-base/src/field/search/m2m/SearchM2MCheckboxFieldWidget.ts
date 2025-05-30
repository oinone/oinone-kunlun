import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { FormM2MCheckboxFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToMany,
    widget: 'Checkbox'
  })
)
export class SearchM2MCheckboxFieldWidget extends FormM2MCheckboxFieldWidget {}

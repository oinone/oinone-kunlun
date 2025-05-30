import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { FormM2MFieldSelectWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToOne,
    widget: 'MultiSelect'
  })
)
export class SearchM2OMultiSelectFieldWidget extends FormM2MFieldSelectWidget {}

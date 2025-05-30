import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { FormO2OTreeSelectFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.OneToOne,
    widget: 'TreeSelect'
  })
)
export class SearchO2OTreeSelectFieldWidget extends FormO2OTreeSelectFieldWidget {}

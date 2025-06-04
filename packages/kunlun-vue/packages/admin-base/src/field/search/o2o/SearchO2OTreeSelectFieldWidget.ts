import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
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

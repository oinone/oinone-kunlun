import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { FormO2MTreeSelectFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.OneToMany,
    widget: 'TreeSelect'
  })
)
export class SearchO2MTreeSelectFieldWidget extends FormO2MTreeSelectFieldWidget {}

import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { FormO2MCascaderFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.OneToMany,
    widget: 'Cascader'
  })
)
export class SearchO2MCascaderFieldWidget extends FormO2MCascaderFieldWidget {}

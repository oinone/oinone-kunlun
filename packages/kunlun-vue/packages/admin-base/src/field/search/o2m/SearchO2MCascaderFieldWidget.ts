import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
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

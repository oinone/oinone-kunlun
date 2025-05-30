import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { FormO2OCascaderFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.OneToOne,
    widget: 'Cascader'
  })
)
export class SearchO2OCascaderFieldWidget extends FormO2OCascaderFieldWidget {}

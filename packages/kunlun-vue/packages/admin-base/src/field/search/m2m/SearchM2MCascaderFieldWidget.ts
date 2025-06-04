import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { FormM2MCascaderFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToMany,
    widget: 'Cascader'
  })
)
export class SearchM2MCascaderFieldWidget extends FormM2MCascaderFieldWidget {}

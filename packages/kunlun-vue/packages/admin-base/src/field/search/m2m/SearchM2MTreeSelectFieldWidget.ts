import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../basic';
import { FormM2MTreeSelectFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToMany,
    widget: 'TreeSelect'
  })
)
export class SearchM2MTreeSelectFieldWidget extends FormM2MTreeSelectFieldWidget {}

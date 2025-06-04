import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic';
import { FormIntegerMultiFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Float,
    widget: 'Tag'
  })
)
export class SearchFloatTagFieldWidget extends FormIntegerMultiFieldWidget {}

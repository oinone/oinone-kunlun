import { SPI } from '@oinone/kunlun-spi';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { FormStringFieldWidget } from '../../form';
import { FormFieldWidget } from '../../../basic/field';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Text
  })
)
export class SearchTextFieldWidget extends FormStringFieldWidget {}

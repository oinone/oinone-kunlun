import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic';
import { FormTextFieldWidget } from '../../text';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.String,
    widget: 'TextArea'
  })
)
export class FormTextAreaStringFieldWidget extends FormTextFieldWidget {}

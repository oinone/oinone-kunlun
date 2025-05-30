import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { FormTextFieldWidget } from '../../text';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.String,
    widget: 'TextArea'
  })
)
export class FormStringTextAreaFieldWidget extends FormTextFieldWidget {}

/**
 * @deprecated please using FormStringTextAreaFieldWidget
 */
export const FormTextAreaStringFieldWidget = FormStringTextAreaFieldWidget;

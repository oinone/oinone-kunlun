import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic/field/FormFieldWidget';
import { FormM2OFormFieldWidget } from '../../m2o/form/FormM2OFormFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: [ModelFieldType.OneToOne],
    widget: 'Form'
  })
)
export class FormO2OFormFieldWidget extends FormM2OFormFieldWidget {}

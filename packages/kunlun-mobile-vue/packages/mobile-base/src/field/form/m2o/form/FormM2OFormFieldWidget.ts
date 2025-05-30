import { RuntimeM2OField } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseFieldWidget, FormSubviewObjectFieldWidget } from '../../../../basic';
import { FORM_WIDGET } from '../../../../typing';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: [ModelFieldType.ManyToOne],
    widget: ['form', FORM_WIDGET]
  })
)
export class FormM2OFormFieldWidget extends FormSubviewObjectFieldWidget<RuntimeM2OField> {}

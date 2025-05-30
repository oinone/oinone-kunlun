import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseElementWidget, BaseFormWidget } from '../../basic';
import { FORM_WIDGET } from '../../typing';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Form,
    widget: ['form', FORM_WIDGET]
  })
)
export class FormWidget extends BaseFormWidget {}

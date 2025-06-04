import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseFieldWidget } from '../../../basic';
import { FormStringMultiTagFieldWidget } from '../string';

@SPI.ClassFactory(
  BaseFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.Integer,
    widget: 'Tag'
  })
)
export class FormIntegerTagFieldWidget extends FormStringMultiTagFieldWidget {}

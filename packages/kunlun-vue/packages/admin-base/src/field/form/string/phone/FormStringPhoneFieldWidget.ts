import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../../basic';
import { FormPhoneFieldWidget } from './FormPhoneFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.String,
    widget: 'Phone'
  })
)
export class FormStringPhoneFieldWidget extends FormPhoneFieldWidget {
  /**
   * 旨在T-type为string的字段也能指定使用phone
   */
}

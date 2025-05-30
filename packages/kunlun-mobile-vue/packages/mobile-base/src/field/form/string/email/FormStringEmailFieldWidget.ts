import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormFieldWidget } from '../../../../basic';
import { FormEmailFieldWidget } from './FormEmailFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.String,
    widget: 'Email'
  })
)
export class FormStringEmailFieldWidget extends FormEmailFieldWidget {
  /**
   * 旨在T-type为string的字段也能指定使用email
   */
}

import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormFieldWidget } from '../../../../basic';
import { SearchPhoneFieldWidget } from './SearchPhoneFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.String,
    widget: 'Phone'
  })
)
export class SearchStringPhoneFieldWidget extends SearchPhoneFieldWidget {
  /**
   * 旨在T-type为string的字段也能指定使用phone
   */
}

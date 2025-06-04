import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

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

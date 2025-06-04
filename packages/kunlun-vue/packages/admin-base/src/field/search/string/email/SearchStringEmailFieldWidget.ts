import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic';
import { SearchEmailFieldWidget } from './SearchEmailFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.String,
    widget: 'Email'
  })
)
export class SearchStringEmailFieldWidget extends SearchEmailFieldWidget {
  /**
   * 旨在T-type为string的字段也能指定使用email
   */
}

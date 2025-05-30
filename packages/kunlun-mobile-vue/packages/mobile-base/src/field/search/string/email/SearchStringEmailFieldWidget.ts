import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { SearchEmailFieldWidget } from './SearchEmailFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Email,
    widget: 'Email'
  })
)
export class SearchStringEmailFieldWidget extends SearchEmailFieldWidget {
  /**
   * 旨在T-type为string的字段也能指定使用email
   */
}

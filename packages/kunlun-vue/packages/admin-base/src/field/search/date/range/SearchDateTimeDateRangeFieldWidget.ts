import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { SearchDateRangeFieldWidget } from './SearchDateRangeFieldWidget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.DateTime,
    widget: 'DatePicker'
  })
)
export class SearchDateTimeDateRangeFieldWidget extends SearchDateRangeFieldWidget {}

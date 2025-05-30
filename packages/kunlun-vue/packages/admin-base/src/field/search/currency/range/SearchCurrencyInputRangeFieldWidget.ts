import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { SearchFloatInputRangeFieldWidget } from '../../float';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Currency,
    widget: 'InputRange'
  })
)
export class SearchCurrencyInputRangeFieldWidget extends SearchFloatInputRangeFieldWidget {}

import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
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

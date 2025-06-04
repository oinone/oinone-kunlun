import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../../basic';
import { SearchNumberRangeFieldWidget } from '../../abstract';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Float,
    widget: 'InputRange'
  })
)
export class SearchFloatInputRangeFieldWidget extends SearchNumberRangeFieldWidget {}

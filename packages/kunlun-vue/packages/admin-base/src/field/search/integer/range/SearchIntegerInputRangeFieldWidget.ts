import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { SearchNumberRangeFieldWidget } from '../../abstract';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.Integer,
    widget: 'InputRange'
  })
)
export class SearchIntegerInputRangeFieldWidget extends SearchNumberRangeFieldWidget {
  @Widget.Reactive()
  protected get precision(): number | null | undefined {
    return 0;
  }
}

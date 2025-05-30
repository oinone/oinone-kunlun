import { ModelFieldType, ViewType } from '@kunlun/meta';
import { BooleanHelper, Optional } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../basic';
import { FormM2OAddressFieldWidget } from '../../form';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.ManyToOne,
    widget: 'Address'
  })
)
export class SearchM2OAddressFieldWidget extends FormM2OAddressFieldWidget {
  @Widget.Reactive()
  protected get changeOnSelect(): boolean {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().changeOnSelect)).orElse(true)!;
  }
}

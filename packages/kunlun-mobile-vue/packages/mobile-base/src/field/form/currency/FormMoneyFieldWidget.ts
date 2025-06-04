import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { FormFieldWidget } from '../../../basic/field';
import { FormFloatFieldWidget } from '../float';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.Currency
  })
)
export class FormMoneyFieldWidget extends FormFloatFieldWidget {
  public initialize(props) {
    super.initialize(props);
    return this;
  }
}

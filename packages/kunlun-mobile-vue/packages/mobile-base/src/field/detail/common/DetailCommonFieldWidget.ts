import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic/field';
import DetailCommonField from './DetailCommonField.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: [ModelFieldType.Text, ModelFieldType.Related]
  })
)
export class DetailCommonFieldWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DetailCommonField);
    return this;
  }

  @Widget.Reactive()
  protected get type() {
    return this.getDsl().type;
  }
}

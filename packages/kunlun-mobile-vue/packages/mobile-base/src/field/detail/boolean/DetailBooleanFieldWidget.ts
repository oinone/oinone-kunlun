import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../basic/field';
import Boolean from './Boolean.vue';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: [ViewType.Detail], ttype: ModelFieldType.Boolean }))
export class DetailBooleanFieldWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Boolean);
    return this;
  }
}

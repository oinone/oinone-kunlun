import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { Widget } from '@kunlun/vue-widget';
import { InputType } from '@kunlun/vue-ui-common';
import { FormFieldWidget } from '../../../../basic';
import DetailString from './DetailString.vue';
import { FormInputAbstractFieldWidget } from '../../../form';
import { toCiphertext } from '../../../util';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: [ModelFieldType.String, ModelFieldType.Phone, ModelFieldType.Email]
  })
)
export class DetailStringWidget extends FormInputAbstractFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DetailString);
    return this;
  }

  @Widget.Reactive()
  protected get currentValue() {
    if (this.value && this.type === InputType.PASSWORD) {
      return toCiphertext(this.value);
    }
    return this.value;
  }

  @Widget.Reactive()
  protected get emptyStyle() {
    return this.getDsl().emptyStyle;
  }
}

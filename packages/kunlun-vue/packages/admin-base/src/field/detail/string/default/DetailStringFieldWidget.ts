import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { InputType } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormInputAbstractFieldWidget } from '../../../form';
import { toCiphertext } from '../../../util';
import DetailString from './DetailString.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Detail,
    ttype: [ModelFieldType.String, ModelFieldType.Phone, ModelFieldType.Email]
  })
)
export class DetailStringFieldWidget extends FormInputAbstractFieldWidget {
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

/**
 * @deprecated please using DetailStringFieldWidget
 */
export const DetailStringWidget = DetailStringFieldWidget;

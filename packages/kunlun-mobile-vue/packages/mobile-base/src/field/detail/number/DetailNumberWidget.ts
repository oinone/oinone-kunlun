import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { toString } from 'lodash-es';
import { FormFieldWidget } from '../../../basic/field';
import { FormNumberAbstractFieldWidget } from '../../form/abstract/FormNumberAbstractFieldWidget';
import { numberAddThousandth, numberZeroFill } from '../../util';
import DetailString from '../string/default/DetailString.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    multi: false,
    ttype: [ModelFieldType.Integer, ModelFieldType.Long, ModelFieldType.Float, ModelFieldType.Currency]
  })
)
export class DetailNumberWidget extends FormNumberAbstractFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DetailString);
    return this;
  }

  @Widget.Reactive()
  protected get currentValue() {
    let cv = numberZeroFill(toString(this.value), this.precision);
    if (this.showThousandth) {
      cv = numberAddThousandth(cv);
    }
    return cv === '' ? undefined : cv;
  }
}

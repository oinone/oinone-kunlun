import { Widget } from '@oinone/kunlun-vue-widget';
import { toString } from 'lodash-es';
import { FormNumberAbstractFieldWidget } from '../../form/abstract/FormNumberAbstractFieldWidget';
import { numberAddThousandth, numberZeroFill } from '../../util';
import DetailString from '../string/default/DetailString.vue';

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

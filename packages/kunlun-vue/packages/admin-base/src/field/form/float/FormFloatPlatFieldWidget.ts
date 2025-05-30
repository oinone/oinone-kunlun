import { ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../basic';
import { FormRangeFieldsWidget } from '../../range';
import Plat from './Plat.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    widget: 'Plat'
  })
)
export class FormFloatPlatFieldWidget extends FormRangeFieldsWidget<number> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Plat);
    return this;
  }

  protected defaultDecimal = 6;

  @Widget.Reactive()
  protected get startFieldDecimal() {
    return (this.startField as any)?.decimal || this.defaultDecimal;
  }

  @Widget.Reactive()
  protected get endFieldDecimal() {
    return (this.endField as any)?.decimal || this.defaultDecimal;
  }
}

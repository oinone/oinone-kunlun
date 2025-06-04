import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import SelectFieldAction from './SelectFieldAction.vue';
import { SelectFieldActionWidget } from '../SelectFieldActionWidget';
import { FormFieldWidget } from '../../../../basic';
import { SelectWidgetType } from '../typing';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    widget: 'MetaPanelAction'
  })
)
export class SelectActionWidget extends SelectFieldActionWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(SelectFieldAction);
    return this;
  }

  @Widget.Reactive()
  protected widgetType = SelectWidgetType.ACTION;
}

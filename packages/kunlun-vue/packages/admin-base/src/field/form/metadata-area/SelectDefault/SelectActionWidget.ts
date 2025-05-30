import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
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

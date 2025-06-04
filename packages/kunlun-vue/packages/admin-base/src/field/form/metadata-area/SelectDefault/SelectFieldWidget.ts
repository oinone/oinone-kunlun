import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import SelectFieldAction from './SelectFieldAction.vue';
import { SelectFieldActionWidget } from '../SelectFieldActionWidget';
import { FormFieldWidget } from '../../../../basic';
import { SelectWidgetType } from '../typing';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    widget: 'MetaPanelField'
  })
)
export class SelectFieldWidget extends SelectFieldActionWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(SelectFieldAction);
    return this;
  }

  protected widgetType = SelectWidgetType.FIELD;
}

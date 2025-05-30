import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormStringFieldWidget } from '../FormStringFieldWidget';
import DefaultIconSelect from './DefaultIconSelect.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Search],
    ttype: ModelFieldType.String,
    widget: 'IconSelect'
  })
)
export class FormStringIconSelectFieldWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultIconSelect);
    return this;
  }

  @Widget.Reactive()
  protected get modalTitle() {
    return this.getDsl().modalTitle;
  }

  @Widget.Reactive()
  protected get icons() {
    return this.getDsl().icons;
  }
}

/**
 * @deprecated please using FormStringIconSelectFieldWidget
 */
export const FormIconSelectFieldWidget = FormStringIconSelectFieldWidget;

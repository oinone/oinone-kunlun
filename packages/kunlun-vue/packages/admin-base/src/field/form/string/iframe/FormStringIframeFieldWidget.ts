import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { FormFieldWidget } from '../../../../basic';
import { FormStringInputFieldWidget } from '../input';
import DefaultFormIframe from './DefaultFormIframe.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.String,
    widget: ['Iframe']
  })
)
export class FormStringIframeFieldWidget extends FormStringInputFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultFormIframe);
    return this;
  }
}

/**
 * @deprecated please using FormStringIframeFieldWidget
 */
export const FormStringIframeWidget = FormStringIframeFieldWidget;

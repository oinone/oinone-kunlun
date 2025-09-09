import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { InputMediaMode } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormStringInputFieldWidget } from '../input';
import DefaultFormIframe from './DefaultFormIframe.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.String,
    widget: 'Iframe'
  })
)
export class FormStringIframeFieldWidget extends FormStringInputFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultFormIframe);
    return this;
  }

  @Widget.Reactive()
  protected get mode() {
    return this.getDsl().mode || InputMediaMode.DYNAMIC;
  }
}

/**
 * @deprecated please using FormStringIframeFieldWidget
 */
export const FormStringIframeWidget = FormStringIframeFieldWidget;

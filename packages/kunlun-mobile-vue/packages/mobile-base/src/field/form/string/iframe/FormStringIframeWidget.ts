import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormStringFieldSingleWidget } from '../FormStringFieldSingleWidget';
import { FormFieldWidget } from '../../../../basic';
import DefaultFormIframe from './DefaultFormIframe.vue';
import { FormLayout } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form],
    ttype: ModelFieldType.String,
    widget: ['Iframe']
  })
)
export class FormStringIframeWidget extends FormStringFieldSingleWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultFormIframe);
    return this;
  }

  @Widget.Reactive()
  public get layout(): string | undefined {
    return FormLayout.VERTICAL.toString();
  }
}

import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormStringFieldSingleWidget } from '../FormStringFieldSingleWidget';
import { FormFieldWidget } from '../../../../basic';
import DefaultFormIframe from './DefaultFormIframe.vue';
import { FormLayout } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';

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

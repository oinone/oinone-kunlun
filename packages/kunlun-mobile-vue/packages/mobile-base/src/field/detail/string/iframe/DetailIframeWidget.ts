import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormStringFieldWidget } from '../../../form/string/FormStringFieldWidget';
import { FormFieldWidget } from '../../../../basic';
import Iframe from './Iframe.vue';
import { FormLayout } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.String,
    widget: ['Iframe']
  })
)
export class DetailIframeWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Iframe);
    return this;
  }

  @Widget.Reactive()
  public get layout(): string | undefined {
    return FormLayout.VERTICAL.toString();
  }
}

import { ModelFieldType, ViewType } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';

import { FormStringFieldWidget } from '../../../form/string/FormStringFieldWidget';
import { FormFieldWidget } from '../../../../basic';
import Iframe from './Iframe.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: ModelFieldType.String,
    widget: ['Iframe']
  })
)
export class DetailStringIframeFieldWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Iframe);
    return this;
  }
}

/**
 * @deprecated please using DetailStringIframeFieldWidget
 */
export const DetailIframeWidget = DetailStringIframeFieldWidget;

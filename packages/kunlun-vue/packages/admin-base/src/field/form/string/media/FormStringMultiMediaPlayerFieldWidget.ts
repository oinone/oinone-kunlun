import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { FormFieldWidget } from '../../../../basic';
import { FormStringFieldWidget } from '../FormStringFieldWidget';
import Media from './Media.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail, ViewType.Table],
    ttype: ModelFieldType.String,
    multi: true,
    widget: ['MediaPlayer']
  })
)
export class FormStringMultiMediaPlayerFieldWidget extends FormStringFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Media);
    return this;
  }

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }
}

/**
 * @deprecated please using FormStringMultiMediaPlayerFieldWidget
 */
export const FormStringMultiMediaWidget = FormStringMultiMediaPlayerFieldWidget;

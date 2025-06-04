import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';

import { FormFieldWidget } from '../../../../basic';
import { FormStringFieldWidget } from '../FormStringFieldWidget';
import Media from './Media.vue';
import { WidgetTrigger } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail, ViewType.Table],
    ttype: ModelFieldType.String,
    multi: true,
    widget: ['MediaPlayer']
  })
)
export class FormStringMultiMediaWidget extends FormStringFieldWidget {
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

  @Widget.Reactive()
  public get showAllowClear() {
    return false;
  }

  @Widget.Reactive()
  public get noBorderBottom() {
    return true;
  }

  @Widget.Reactive()
  public get fakeVertical() {
    return true;
  }
}

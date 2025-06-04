import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../basic';
import Html from './Html.vue';

@SPI.ClassFactory(FormFieldWidget.Token({ viewType: [ViewType.Detail], ttype: ModelFieldType.HTML }))
export class DetailHtmlFieldWidget extends FormFieldWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(Html);
    return this;
  }

  @Widget.Reactive()
  protected get encode() {
    const _encode = this.getDsl().encode;
    if (_encode) {
      return BooleanHelper.toBoolean(_encode);
    }
    return false;
  }

  @Widget.Reactive()
  public get isAutoHeight() {
    return true;
  }
}

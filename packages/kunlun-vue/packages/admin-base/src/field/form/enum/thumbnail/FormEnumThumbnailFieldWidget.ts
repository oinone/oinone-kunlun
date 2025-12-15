import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import { FormEnumFieldAbstractWidget } from '../FormEnumFieldAbstractWidget';
import FormEnumThumbnail from './FormEnumThumbnail.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Form, ViewType.Detail],
    ttype: ModelFieldType.Enum,
    widget: 'Thumbnail'
  })
)
export class FormEnumThumbnailFieldWidget extends FormEnumFieldAbstractWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FormEnumThumbnail);
    return this;
  }

  @Widget.Reactive()
  protected get allowClear() {
    return BooleanHelper.toBoolean(this.getDsl().allowClear) || false;
  }
}

export const FormEnumThumbnailWidget = FormEnumThumbnailFieldWidget;

import { RuntimeNumberField, RuntimeStringField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic/field/FormFieldWidget';
import DetailTag from './DetailTag.vue';
import { OptionColorStyle } from '../../../FieldCommonEnum';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: [ViewType.Detail],
    ttype: [ModelFieldType.String, ModelFieldType.Integer],
    multi: true
  })
)
export class DetailStringTagWidget extends FormFieldWidget<string[], RuntimeStringField | RuntimeNumberField> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DetailTag);
    return this;
  }

  @Widget.Reactive()
  protected get displayNameList(): string[] | { label: string }[] {
    return this.value || [];
  }

  @Widget.Reactive()
  protected get optionColor() {
    return this.optionColorStyle === OptionColorStyle.COLORFUL;
  }

  @Widget.Reactive()
  protected get optionColorStyle() {
    return this.getDsl().optionColorStyle || OptionColorStyle.COLORFUL;
  }
}

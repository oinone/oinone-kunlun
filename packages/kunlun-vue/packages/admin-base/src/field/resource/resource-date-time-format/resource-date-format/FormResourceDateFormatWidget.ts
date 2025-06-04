import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../../../basic';
import FormResourceDateFormat from './FormResourceDateFormat.vue';
import { ResourceDateTimeOption } from '@oinone/kunlun-shared';
import { getResourceDateFormatOptions } from '../constant';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.Map,
    widget: [
      'HyphenMapWidget',
      'SlashMapWidget',
      'ChineseMapWidget',
      'HyphenYearMonthMapWidget',
      'SlashYearMonthMapWidget',
      'ChineseYearMonthMapWidget'
    ]
  })
)
export class FormResourceDateFormatWidget extends FormFieldWidget<{ value: ResourceDateTimeOption[] }> {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(FormResourceDateFormat);
    return this;
  }

  @Widget.Reactive()
  protected get currentRelationField() {
    return this.getDsl().relationField || '';
  }

  @Widget.Reactive()
  protected get optionalFields(): string[] {
    const { optionalFields = '' } = this.getDsl();
    return optionalFields.split(',');
  }

  @Widget.Reactive()
  protected get options(): ResourceDateTimeOption[] {
    const opts = getResourceDateFormatOptions();

    return opts.filter((opt) => this.optionalFields.includes(opt.id));
  }

  @Widget.Watch('value', { deep: true })
  protected watchSelectedValue() {
    if (!this.currentRelationField) {
      return;
    }

    const format = this.value?.value.map((val) => val.code + val.concat || '').join('');
    this.formData[this.currentRelationField] = format;
  }

  @Widget.Method()
  protected onChangeOption(opt) {
    if (!this.value) {
      this.change({ value: [] });
    }

    if (!this.value?.value) {
      this.value!.value = [];
    }

    this.value!.value.push({ ...opt });

    this.change(this.value);
  }

  @Widget.Method()
  protected onRemoveOption(index) {
    this.value!.value.splice(index, 1);
    this.change(this.value);
  }
}

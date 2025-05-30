import { ActiveRecord, IResourceDateTimeFormat, queryResourceDateTimeFormat } from '@kunlun/engine';
import { ViewType } from '@kunlun/meta';
import {
  BooleanHelper,
  defaultDateFormatKey,
  defaultTimeFormatKey,
  ObjectUtils,
  Optional,
  StandardString
} from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { ValidateTrigger } from '@kunlun/vue-ui-common';
import { Widget, WidgetComponent } from '@kunlun/vue-widget';
import { BaseElementWidget } from '../../../../basic';
import { FormRangeFieldsWidget } from '../../../range';
import DefaultDateTimeRangePicker from './DefaultDateTimeRangePicker.vue';

@SPI.ClassFactory(
  BaseElementWidget.Token({
    viewType: ViewType.Form,
    widget: 'DateTimeRangePicker'
  })
)
export class FormDateTimeRangeFieldWidget extends FormRangeFieldsWidget<StandardString> {
  public defaultValidateTrigger: ValidateTrigger[] = [ValidateTrigger.CHANGE];

  protected getInitializeComponent(): WidgetComponent {
    return DefaultDateTimeRangePicker;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(this.getInitializeComponent());
    return this;
  }

  @Widget.Reactive()
  protected resourceDateTimeFormat = {} as IResourceDateTimeFormat;

  @Widget.Reactive()
  protected get format(): string | undefined {
    return this.getDsl().format;
  }

  @Widget.Reactive()
  protected get dateFormat(): string | undefined {
    let dateFormat = this.executeExpression<string>(this.getDsl().dateFormat);
    if (!dateFormat) {
      dateFormat = defaultDateFormatKey;
    }
    return (
      ObjectUtils.toUpperSnakeCase(this.resourceDateTimeFormat.resourceDateFormat as unknown as Record<string, string>)[
        dateFormat
      ] || dateFormat
    );
  }

  @Widget.Reactive()
  protected get timeFormat(): string | undefined {
    let timeFormat = this.executeExpression<string>(this.getDsl().timeFormat);
    if (!timeFormat) {
      timeFormat = defaultTimeFormatKey;
    }
    return (
      ObjectUtils.toUpperSnakeCase(this.resourceDateTimeFormat.resourceTimeFormat as unknown as Record<string, string>)[
        timeFormat
      ] || timeFormat
    );
  }

  @Widget.Reactive()
  protected get allowClear(): boolean {
    return Optional.ofNullable(this.getDsl().allowClear)
      .map((v) => BooleanHelper.toBoolean(v))
      .orElse(true)!;
  }

  @Widget.Reactive()
  protected get startPlaceholder() {
    return this.getDsl().startPlaceholder;
  }

  @Widget.Reactive()
  protected get endPlaceholder() {
    return this.getDsl().endPlaceholder;
  }

  @Widget.Method()
  public change(val) {
    super.change(val);
    if (val == null || val.length === 0) {
      this.closePanelChange();
      return;
    }
    this.blur();
  }

  @Widget.Method()
  public async closePanelChange() {
    if (!this.blurValueChange()) {
      return;
    }
    let isChange = await this.constructDataBack();
    const res = this.clearFieldsCallback();
    if (res) {
      isChange = res;
    }
    if (isChange) {
      this.reloadFormData$.subject.next(true);
    }
  }

  protected generatorConstructMirrorSubmitData(): ActiveRecord {
    const { formData, startField, endField } = this;
    return {
      [startField.name]: formData[startField.data],
      [endField.name]: formData[endField.data]
    };
  }

  @Widget.Method()
  public openPanelChange() {
    this.setBlurValue(this.value);
  }

  @Widget.Method()
  public clearValue() {
    const startField = this.startField?.data;
    const endField = this.endField?.data;
    if (startField) {
      this.formData[startField] = null;
    }
    if (endField) {
      this.formData[endField] = null;
    }
  }

  protected async $$created() {
    super.$$created();
    this.resourceDateTimeFormat = await queryResourceDateTimeFormat();
  }
}

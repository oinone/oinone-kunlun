import { IResourceDateTimeFormat, queryResourceDateTimeFormat, RuntimeSearchField } from '@oinone/kunlun-engine';
import { ModelFieldType, ViewType } from '@oinone/kunlun-meta';
import { CallChaining, defaultDateFormatKey, defaultTimeFormatKey, ObjectUtils, RSQLOperators } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget, WidgetComponent } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { FormFieldWidget } from '../../../../basic';
import { SearchRangeFieldWidget } from '../../../range';
import DefaultDateTimeRangePicker from './DefaultDateTimeRangePicker.vue';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Search,
    ttype: ModelFieldType.DateTime
  })
)
export class SearchDateTimeRangeFieldWidget extends SearchRangeFieldWidget<
  string | [string, string],
  RuntimeSearchField
> {
  @Widget.Reactive()
  @Widget.Inject()
  protected mountedCallChaining: CallChaining | undefined;

  protected getInitializeComponent(): WidgetComponent {
    return DefaultDateTimeRangePicker;
  }

  @Widget.Reactive()
  protected resourceDateTimeFormat = {} as IResourceDateTimeFormat;

  @Widget.Reactive()
  protected get format(): string | undefined {
    return this.getDsl().format;
  }

  @Widget.Reactive()
  protected get valueFormat(): string | undefined {
    return this.getDsl().valueFormat;
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
  protected get isSingle() {
    const { operator } = this;
    if (isNil(operator)) {
      return false;
    }
    return RSQLOperators.isSingle(operator);
  }

  @Widget.Reactive()
  public get value() {
    const value = super.value;
    if (this.isSingle) {
      if (Array.isArray(value)) {
        return value[0];
      }
    }
    return value;
  }

  @Widget.Reactive()
  protected get placeholder() {
    const placeholder = super.placeholder;
    if (this.isSingle) {
      if (Array.isArray(placeholder)) {
        return placeholder[0];
      }
    }
    return placeholder;
  }

  protected mountedProcess() {
    if (isNil(this.formData[this.itemName]) && !!this.startDefaultValue && !!this.endDefaultValue) {
      this.formData[this.itemName] = [this.startDefaultValue, this.endDefaultValue];
    }
  }

  protected $$mounted() {
    super.$$mounted();
    this.mountedCallChaining?.hook(this.path, () => {
      this.mountedProcess();
    });
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.mountedCallChaining?.unhook(this.path);
  }

  protected async $$created() {
    super.$$created();
    this.resourceDateTimeFormat = await queryResourceDateTimeFormat();
  }
}

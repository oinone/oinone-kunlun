import { RuntimeModelField, RuntimeSearchField, translateValueByKey } from '@oinone/kunlun-engine';
import { Widget, WidgetComponent } from '@oinone/kunlun-vue-widget';
import { FormFieldWidget } from '../../basic';

export abstract class SearchRangeFieldWidget<
  Value = unknown,
  Field extends RuntimeModelField & RuntimeSearchField = RuntimeModelField & RuntimeSearchField
> extends FormFieldWidget<Value, Field> {
  protected abstract getInitializeComponent(): WidgetComponent;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(this.getInitializeComponent());
    return this;
  }

  @Widget.Reactive()
  protected get startPlaceholder() {
    return translateValueByKey(this.getDsl().startPlaceholder);
  }

  @Widget.Reactive()
  protected get endPlaceholder() {
    return translateValueByKey(this.getDsl().endPlaceholder);
  }

  @Widget.Reactive()
  protected get operator() {
    return this.field.operator;
  }

  @Widget.Reactive()
  protected get startDefaultValue() {
    return this.getDsl().startDefaultValue;
  }

  @Widget.Reactive()
  protected get endDefaultValue() {
    return this.getDsl().endDefaultValue;
  }
}

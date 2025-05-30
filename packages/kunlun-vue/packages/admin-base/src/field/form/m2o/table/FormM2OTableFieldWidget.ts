import { ActiveRecord, ActiveRecords, RuntimeM2OField, SubmitRelationHandler, SubmitValue } from '@kunlun/engine';
import { ModelFieldType, ViewType } from '@kunlun/meta';
import { ReturnPromise } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { ValidateTrigger, WidgetTrigger } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { FormFieldWidget, FormSubviewObjectFieldWidget } from '../../../../basic';
import { InlineTable } from '../../../../components';
import { TABLE_WIDGET } from '../../../../typing';

@SPI.ClassFactory(
  FormFieldWidget.Token({
    viewType: ViewType.Form,
    ttype: ModelFieldType.ManyToOne,
    widget: TABLE_WIDGET
  })
)
export class FormM2OTableFieldWidget extends FormSubviewObjectFieldWidget<RuntimeM2OField> {
  protected defaultSubviewType = ViewType.Table;

  public defaultValidateTrigger: ValidateTrigger[] = [ValidateTrigger.CHANGE];

  protected defaultConstructDataTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  protected defaultClearFieldsTrigger() {
    return [WidgetTrigger.CHANGE];
  }

  private isInit = true;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(InlineTable);
    return this;
  }

  @Widget.Reactive()
  @Widget.Provide()
  public get dataSource(): ActiveRecord[] | undefined {
    return this.getCurrentDataSource() ?? this.parentDataSource;
  }

  public reloadActiveRecords(records: ActiveRecords | undefined) {
    if (this.isInit) {
      this.isInit = false;
      return;
    }
    this.setCurrentActiveRecords(records);
    this.change(records?.[0]);
  }

  protected async refreshValueProcess() {
    // do nothing.
  }

  protected initSubviewData(): ReturnPromise<void> {
    // fixme @zbh 20240909 表格查询时，应处理当前选中值。将当前选中值单独使用queryOne进行查询，并发起queryPage时过滤初始选中值。
    this.isDataSourceProvider = false;
    let currentValue = this.value;
    if (currentValue == null) {
      currentValue = {};
      this.setValue(currentValue);
      this.setCurrentActiveRecords([]);
    } else {
      this.setCurrentActiveRecords([currentValue]);
    }
    this.setCurrentDataSource(null);
  }

  public async submit(submitValue: SubmitValue) {
    const { field, itemName, value, viewMode, submitCache, submitType, relationUpdateType } = this;
    return SubmitRelationHandler.M2O(
      field,
      itemName,
      submitValue,
      value,
      viewMode,
      submitCache,
      submitType,
      relationUpdateType
    );
  }
}

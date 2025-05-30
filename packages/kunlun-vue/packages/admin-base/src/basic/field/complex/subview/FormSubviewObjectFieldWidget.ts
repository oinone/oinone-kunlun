import { ActiveRecord, ActiveRecords, RuntimeM2OField, RuntimeO2OField } from '@kunlun/engine';
import { LifeCycleTypes } from '@kunlun/event';
import { ViewType } from '@kunlun/meta';
import { Condition } from '@kunlun/request';
import { ReturnPromise } from '@kunlun/shared';
import { Widget } from '@kunlun/vue-widget';
import { InlineForm } from '../../../../components';
import { IFormSubviewObjectFieldWidget, RefreshProcessFunction } from '../../../types';
import { FormComplexFieldProps } from '../FormComplexFieldWidget';
import { FormSubviewFieldWidget } from './FormSubviewFieldWidget';

export class FormSubviewObjectFieldWidget<
    Field extends RuntimeO2OField | RuntimeM2OField = RuntimeO2OField | RuntimeM2OField,
    Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
  >
  extends FormSubviewFieldWidget<ActiveRecord, Field, Props>
  implements IFormSubviewObjectFieldWidget<Field>
{
  protected defaultSubviewType = ViewType.Form;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(InlineForm);
    return this;
  }

  @Widget.Method()
  @Widget.Inject('refreshProcess')
  protected parentRefreshProcess: RefreshProcessFunction | undefined;

  @Widget.Method()
  @Widget.Provide()
  protected async refreshProcess(condition?: Condition) {
    // do nothing.
  }

  public reloadDataSource(records: ActiveRecords | undefined) {
    this.setCurrentDataSource(records);
  }

  protected async mountedProcess() {
    await this.initSubviewData();
  }

  protected async refreshParentProcess() {
    await this.initSubviewData();
  }

  protected async refreshValueProcess() {
    await this.initSubviewData();
  }

  /** 子视图数据变更，发起事件通知，不做其它处理 */
  @Widget.Watch('value', { deep: true })
  private onValueChange() {
    this.notify(LifeCycleTypes.ON_FIELD_CHANGE);
  }

  protected initSubviewData(): ReturnPromise<void> {
    let currentValue = this.value;
    if (currentValue == null) {
      currentValue = {};
      this.setValue(currentValue);
    }
    this.dataSource = [currentValue];
    this.activeRecords = [currentValue];
  }
}

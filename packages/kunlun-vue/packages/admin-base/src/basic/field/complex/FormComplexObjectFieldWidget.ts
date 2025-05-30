import { ActiveRecord, RuntimeM2OField, RuntimeO2OField } from '@kunlun/engine';
import { Condition } from '@kunlun/request';
import { Widget } from '@kunlun/vue-widget';
import { RefreshProcessFunction } from '../../types';
import { FormComplexFieldProps, FormComplexFieldWidget } from './FormComplexFieldWidget';

export abstract class FormComplexObjectFieldWidget<
  Field extends RuntimeO2OField | RuntimeM2OField = RuntimeO2OField | RuntimeM2OField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends FormComplexFieldWidget<ActiveRecord, Field, Props> {
  @Widget.Method()
  @Widget.Inject('refreshProcess')
  protected parentRefreshProcess: RefreshProcessFunction | undefined;

  @Widget.Method()
  @Widget.Provide()
  protected async refreshProcess(condition?: Condition) {
    // do nothing.
  }

  protected mountedProcess() {
    const { value } = this;
    this.setCurrentDataSource(value == null ? [] : [value]);
  }
}

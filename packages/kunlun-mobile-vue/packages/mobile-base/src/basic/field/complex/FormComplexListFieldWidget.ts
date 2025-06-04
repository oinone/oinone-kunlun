import { ActiveRecord, RuntimeM2MField, RuntimeO2MField } from '@oinone/kunlun-engine';
import { Condition } from '@oinone/kunlun-request';
import { Widget } from '@oinone/kunlun-vue-widget';
import { RefreshProcessFunction } from '../../types';
import { FormComplexFieldProps, FormComplexFieldWidget } from './FormComplexFieldWidget';

export abstract class FormComplexListFieldWidget<
  Field extends RuntimeO2MField | RuntimeM2MField = RuntimeO2MField | RuntimeM2MField,
  Props extends FormComplexFieldProps<Field> = FormComplexFieldProps<Field>
> extends FormComplexFieldWidget<ActiveRecord[], Field, Props> {
  @Widget.Method()
  @Widget.Inject('refreshProcess')
  protected parentRefreshProcess: RefreshProcessFunction | undefined;

  @Widget.Method()
  @Widget.Provide()
  protected async refreshProcess(condition?: Condition) {
    // do nothing.
  }

  protected mountedProcess() {
    this.setCurrentDataSource(this.value || []);
  }
}

import { ActiveRecord } from '@oinone/kunlun-engine';
import { RowContext } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { VNode } from 'vue';
import { TableComplexFieldWidget } from './TableComplexFieldWidget';

export class TableObjectFieldWidget extends TableComplexFieldWidget<ActiveRecord> {
  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const value = this.compute(context);
    if (value) {
      return this.handleTableLabel(value);
    }
    return '';
  }
}

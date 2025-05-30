import { ActiveRecord } from '@kunlun/engine';
import { RowContext } from '@kunlun/vue-ui';
import { Widget } from '@kunlun/vue-widget';
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

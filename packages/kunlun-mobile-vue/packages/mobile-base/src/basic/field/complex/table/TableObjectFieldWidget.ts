import type { ActiveRecord } from '@oinone/kunlun-engine';
import type { RowContext } from '../../../../ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import type { VNode } from 'vue';
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

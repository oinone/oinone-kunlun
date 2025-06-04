import { ActiveRecord } from '@oinone/kunlun-engine';
import { RowContext } from '@oinone/kunlun-vue-ui';
import { Widget } from '@oinone/kunlun-vue-widget';
import { VNode } from 'vue';
import { TableComplexFieldWidget } from './TableComplexFieldWidget';

export class TableListFieldWidget extends TableComplexFieldWidget<ActiveRecord[]> {
  @Widget.Method()
  public renderDefaultSlot(context: RowContext): VNode[] | string {
    const values = this.compute(context)?.map((v) => this.handleTableLabel(v));
    if (values && values.length) {
      return values.join(', ');
    }
    return '';
  }
}

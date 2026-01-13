import { RowContext } from '@oinone/kunlun-vue-ui';
import { PropType, VNode } from 'vue';
import { DefaultSelectProps } from '../base';

/**
 * 同 oio-column 组件的 props
 */
export interface TableSelectColumn extends Record<string, any> {
  key: string;
  label: string;
  field: string;
  renderDefaultSlot?: (context: RowContext) => string | VNode | undefined;
}

export const DefaultTableSelectProps = {
  ...DefaultSelectProps,
  tableSelectColumns: {
    type: Array as PropType<TableSelectColumn[]>
  },
  tableHeight: {
    type: [String, Number]
  }
};

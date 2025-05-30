import { ActiveRecord } from '@kunlun/engine';
import { PropType } from 'vue';

export enum ChildrenViewType {
  LIST = 'LIST',
  TABLE = 'TABLE'
}

export type TransferOption = { name: string; value: string; label?: string; displayName?: string; model?: string };

export const DefaultTransferProps = {
  value: {
    type: Array as PropType<ActiveRecord[]>
  },
  defaultValue: {
    type: Array as PropType<ActiveRecord[]>
  },
  sortable: {
    type: Boolean,
    default: false
  },
  enableSearch: {
    type: Boolean,
    default: false
  },
  leftDisplayType: {
    type: String as PropType<ChildrenViewType>
  },
  rightDisplayType: {
    type: String as PropType<ChildrenViewType>
  },
  leftFieldDefinitions: {
    type: Array as PropType<ActiveRecord[]>
  },
  rightFieldDefinitions: {
    type: Array as PropType<ActiveRecord[]>
  },
  leftSearchFields: {
    type: Array as PropType<string[]>
  },
  rightSearchFields: {
    type: Array as PropType<string[]>
  },
  leftOptionLabel: {
    type: String
  },
  rightOptionLabel: {
    type: String
  },
  options: {
    type: Array as PropType<ActiveRecord[]>
  },
  leftFields: {
    type: String
  },
  searchFields: {
    type: Array as PropType<string[]>
  },
  rightFields: {
    type: String
  },
  change: {
    type: Function,
    required: true
  },
  leftColumns: {
    type: Array as PropType<Record<string, string>[]>
  },
  rightColumns: {
    type: Array as PropType<Record<string, string>[]>
  }
};

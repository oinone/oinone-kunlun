import { PropType } from 'vue';
import { SelectMode, SelectProperties } from '../oio-select';
import { TagsItem } from './model';

export const OioTagProps = {
  color: {
    type: String,
    default: '#035DFF'
  },
  backgroundColor: {
    type: String,
    default: 'rgba(3, 93, 255, 0.1)'
  },
  icon: {
    type: String
  },
  allowChecked: {
    type: Boolean,
    default: false
  },
  checked: {
    type: Boolean,
    default: false
  },
  closable: {
    type: Boolean,
    default: false
  }
};

export const OioTagsOptionsProps = {
  mode: {
    type: String as PropType<SelectMode | keyof typeof SelectMode>,
    default: SelectMode.single
  },
  value: {
    type: [String, Array] as PropType<string | string[]>
  },
  mappingOptions: {
    type: Boolean,
    default: true
  },
  options: {
    type: Array as PropType<unknown[]>,
    default: []
  },
  properties: {
    type: Object as PropType<SelectProperties>
  },
  customFillProperties: {
    type: Function as PropType<<T>(option: TagsItem<T>, index: number) => TagsItem<T>>
  }
};

export const OioTagsProps = {
  ...OioTagsOptionsProps,
  allowChecked: {
    type: Boolean,
    default: false
  },
  allowClosed: {
    type: Boolean,
    default: false
  }
};

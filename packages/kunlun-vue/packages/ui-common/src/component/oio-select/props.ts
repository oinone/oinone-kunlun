import { PropType } from 'vue';
import { PaginationResult, SelectItem, SelectProperties } from './model';

export enum SelectMode {
  single = 'single',
  multiple = 'multiple'
}

export const OioSelectOptionsProps = {
  mode: {
    type: String as PropType<SelectMode | keyof typeof SelectMode>,
    default: SelectMode.single
  },
  value: {
    type: [String, Object] as PropType<string | SelectItem>,
    default: undefined
  },
  mappingOptions: {
    type: Boolean,
    default: true
  },
  options: {
    type: Array as PropType<unknown[]>,
    default: []
  },
  filterOption: {
    type: [Boolean, Function] as PropType<boolean | ((inputValue, option) => boolean)>,
    default: undefined
  },
  properties: {
    type: Object as PropType<SelectProperties>
  },
  customFillProperties: {
    type: Function as PropType<<T>(option: SelectItem<T>, index: number) => SelectItem<T>>
  }
};

export const OioLazyLoadSelectProps = {
  lazyLoad: {
    type: Boolean,
    default: false
  },
  loadSelected: {
    type: Function as PropType<<T>() => T>
  },
  loadOptions: {
    type: Function as PropType<<T>() => PaginationResult<T>>
  }
};

export const OioSelectProps = {
  ...OioSelectOptionsProps,
  ...OioLazyLoadSelectProps,
  showSearch: {
    type: Boolean,
    default: false
  },
  autofocus: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String
  },
  allowClear: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: undefined
  },
  dropdownClassName: {
    type: [String, Array] as PropType<string | string[]>
  },
  getTriggerContainer: {
    type: Function as PropType<(triggerNode: Node | HTMLElement) => Node | HTMLElement>
  }
};

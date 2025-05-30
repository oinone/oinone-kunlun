import { PropType } from 'vue';
import { PaginationResult, SelectMode } from '../oio-select';
import { CascaderItem, CascaderProperties } from './model';
import { CascaderCheckedStrategy, CascaderDisplayRenderFunction } from './typing';

export const OioCascaderOptionsProps = {
  mode: {
    type: String as PropType<SelectMode | keyof typeof SelectMode>,
    default: SelectMode.single
  },
  value: {
    type: Array as PropType<string[] | string[][]>,
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
    type: Function as PropType<(inputValue, option) => boolean>,
    default: undefined
  },
  properties: {
    type: Object as PropType<CascaderProperties>
  },
  customFillProperties: {
    type: Function as PropType<<T>(option: CascaderItem<T>, index: number) => CascaderItem<T>>
  },
  labelsSeparator: {
    type: String
  },
  displayRender: {
    type: Function as PropType<CascaderDisplayRenderFunction>
  },
  tagRender: {
    type: Function
  },
  maxTagCount: {
    type: [Number, String] as PropType<number | 'responsive'>,
    default: 'responsive'
  },
  maxTagPlaceholder: {
    type: [String, Function]
  },
  multipleCheckedStrategy: {
    type: String as PropType<CascaderCheckedStrategy | keyof typeof CascaderCheckedStrategy>,
    default: CascaderCheckedStrategy.SHOW_CHILD
  }
};

export const OioLazyLoadCascaderProps = {
  loading: {
    type: Boolean,
    default: undefined
  },
  lazyLoad: {
    type: Boolean,
    default: false
  },
  loadSelected: {
    type: Function as PropType<<T>() => T>
  },
  loadOptions: {
    type: Function as PropType<<T>() => PaginationResult<T>>
  },
  loadData: {
    type: Function as PropType<<T>(selectedOptions: CascaderItem<T>[]) => void>
  }
};

export const OioCascaderProps = {
  ...OioCascaderOptionsProps,
  ...OioLazyLoadCascaderProps,
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
  searchValue: {
    type: String
  },
  enableSearch: {
    type: Boolean,
    default: undefined
  },
  dropdownClassName: {
    type: [String, Array] as PropType<string | string[]>
  },
  getTriggerContainer: {
    type: Function as PropType<(triggerNode: Node | HTMLElement) => Node | HTMLElement>
  },
  changeOnSelect: {
    type: Boolean,
    default: false
  }
};

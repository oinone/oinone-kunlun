import { PropType } from 'vue';
import { PaginationResult, SelectMode } from '../oio-select';
import { TreeSelectNode, TreeSelectProperties } from './model';
import { SimpleTreeSelected, TreeSelectCheckedStrategy, TreeSelectTagRenderFunction } from './typing';

export const OioTreeSelectOptionsProps = {
  mode: {
    type: String as PropType<SelectMode | keyof typeof SelectMode>,
    default: SelectMode.single
  },
  value: {
    type: [Object, Array] as PropType<SimpleTreeSelected | SimpleTreeSelected[]>,
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
    type: Object as PropType<TreeSelectProperties>
  },
  customFillProperties: {
    type: Function as PropType<<T>(option: TreeSelectNode<T>, index: number) => TreeSelectNode<T>>
  },
  tagRender: {
    type: Function as PropType<TreeSelectTagRenderFunction>
  },
  maxTagCount: {
    type: [Number, String] as PropType<number | 'responsive'>,
    default: 'responsive'
  },
  maxTagPlaceholder: {
    type: [String, Function]
  },
  multipleCheckedStrategy: {
    type: String as PropType<TreeSelectCheckedStrategy | keyof typeof TreeSelectCheckedStrategy>,
    default: TreeSelectCheckedStrategy.SHOW_CHILD
  },
  treeCheckStrictly: {
    type: Boolean,
    default: undefined
  },
  expandedKeys: {
    type: Array as PropType<string[]>
  }
};

export const OioLazyLoadTreeSelectProps = {
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
    type: Function as PropType<<T>(selectedOptions: TreeSelectNode<T>[]) => void>
  }
};

export const OioTreeSelectProps = {
  ...OioTreeSelectOptionsProps,
  ...OioLazyLoadTreeSelectProps,
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
  }
};

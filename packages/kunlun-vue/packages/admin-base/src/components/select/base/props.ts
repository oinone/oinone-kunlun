import { SelectSearchArea } from '@oinone/kunlun-engine';
import type { OioSelectItem } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import type { PropType, Slot } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic/props';

const AppearanceProps = {
  dropdownClassName: {
    type: [String, Array] as PropType<string | string[]>
  },
  placeholder: {
    type: String
  },
  allowArrow: {
    type: Boolean,
    default: undefined
  },
  allowClear: {
    type: Boolean,
    default: undefined
  },
  getTriggerContainer: {
    type: Function
  }
};

const ControlProps = {
  mode: {
    type: String as PropType<SelectMode | keyof typeof SelectMode>,
    default: SelectMode.single
  },
  value: {
    type: [Object, Array]
  },
  options: {
    type: Array as PropType<OioSelectItem[]>
  },
  initLoad: {
    type: Function
  },
  loadMore: {
    type: Function
  },
  loadMoreLoading: {
    type: Boolean,
    default: undefined
  },
  loadCompleted: {
    type: Boolean,
    default: undefined
  }
};

const SearchProps = {
  allowSearch: {
    type: Boolean,
    default: undefined
  },
  searchArea: {
    type: String as PropType<SelectSearchArea | keyof typeof SelectSearchArea>
  },
  searchValue: {
    type: String
  },
  search: {
    type: Function
  }
};

const SlotProps = {
  tagRender: {
    type: Function as PropType<Slot>
  }
};

export const BaseSelectProps = {
  ...OioCommonProps,
  ...OioMetadataProps,
  ...AppearanceProps,
  ...ControlProps,
  ...SearchProps,
  ...SlotProps,
  'onUpdate:search-value': {
    type: Function
  },
  'onUpdate:dropdown-visible': {
    type: Function
  }
};

export const DefaultSelectProps = {
  ...OioCommonProps,
  ...OioMetadataProps,
  ...AppearanceProps,
  ...ControlProps,
  ...SearchProps,
  ...SlotProps,
  options: {
    type: Array as PropType<OioSelectItem<object>[]>
  },
  initSelectedOptions: {
    type: Array as PropType<OioSelectItem<object>[]>
  },
  selected: {
    type: [Object, Array] as PropType<OioSelectItem<object> | OioSelectItem<object>[]>
  },
  onUpdateSearchValue: {
    type: Function
  },
  onUpdateDropdownVisible: {
    type: Function
  }
};

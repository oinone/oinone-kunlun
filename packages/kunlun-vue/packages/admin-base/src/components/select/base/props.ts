import { SelectSearchArea } from '@oinone/kunlun-engine';
import { OioSelectItem } from '@oinone/kunlun-shared';
import { SelectMode } from '@oinone/kunlun-vue-ui-common';
import { PropType } from 'vue';
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
    type: Array as PropType<object[]>
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
  search: {
    type: Function
  }
};

export const BaseSelectProps = {
  ...OioCommonProps,
  ...OioMetadataProps,
  ...AppearanceProps,
  ...ControlProps,
  ...SearchProps
};

export const DefaultSelectProps = {
  ...BaseSelectProps,
  initSelectedOptions: {
    type: Array as PropType<OioSelectItem[]>
  },
  selected: {
    type: [Object, Array] as PropType<OioSelectItem | OioSelectItem[]>
  }
};

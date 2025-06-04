import { BooleanHelper } from '@oinone/kunlun-shared';
import { computed, PropType, ref } from 'vue';
import { usePlaceholderProps } from '../../basic';

export const RelationSelectProps = {
  dropdownClassName: {
    type: String,
    default: 'oio-select-dropdown form-relation-select-dropdown oio-ant-select-dropdown-global'
  },
  readonly: {
    type: [Boolean, String],
    default: false
  },
  open: {
    type: [Boolean, String],
    default: false
  },
  disabled: {
    type: [Boolean, String],
    default: false
  },
  maxTagCount: {
    type: [Number, String] as PropType<number | 'responsive'>,
    default: 'responsive'
  },
  maxNumber: {
    type: Number
  },
  relationFieldKey: {
    type: String,
    default: 'id'
  },
  showSearch: {
    type: [Boolean, String],
    default: true
  },
  isInitOptions: {
    type: Boolean
  },
  showMoreButton: {
    type: Boolean
  },
  loadMoreLoading: {
    type: Boolean
  },
  allowClear: {
    type: Boolean
  },
  placeholder: {
    type: String
  },
  options: {
    type: Array as PropType<Record<string, unknown>[]>
  },
  change: {
    type: Function,
    default: () => ({})
  },
  blur: {
    type: Function,
    default: () => ({})
  },
  focus: {
    type: Function,
    default: () => ({})
  },
  search: {
    type: Function,
    default: () => ({})
  },
  dropdownVisibleChange: {
    type: Function,
    default: () => ({})
  },
  onSelect: {
    type: Function,
    default: () => ({})
  },
  loadMore: {
    type: Function,
    default: () => ({})
  },
  translate: {
    type: Function,
    default: () => ({})
  },
  getPopupContainer: {
    type: Function
  }
};

export function relationSelectSetup(props) {
  const innerReadonly = computed(() => BooleanHelper.toBoolean(props.readonly));

  const innerDisabled = computed(() => BooleanHelper.toBoolean(props.disabled));

  const currentValue = computed(() => {
    const values: any[] = [];
    (Array.isArray(props.value) ? props.value : []).forEach((item) => {
      if (!item) {
        return;
      }
      values.push({ value: item[props.relationFieldKey] });
    });
    return values;
  });
  const selectRef = ref();
  const innerChange = (e) => {
    if (props.change) {
      props.change(e);
    }

    selectRef.value.focus();
  };

  // 后于change执行
  const innerSelect = (e) => {
    props.onSelect(e);
  };

  const slipSelect = (event) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    // -1 兼容浏览器尺寸缩放
    if (scrollHeight - scrollTop - 1 <= clientHeight) {
      props.loadMore();
    }
  };
  const { placeholder } = usePlaceholderProps(props);
  return {
    placeholder,
    innerReadonly,
    innerDisabled,
    selectRef,
    currentValue,
    innerChange,
    innerSelect,
    slipSelect
  };
}

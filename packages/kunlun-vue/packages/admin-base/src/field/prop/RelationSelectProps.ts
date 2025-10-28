import { SelectSearchArea } from '@oinone/kunlun-engine';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { delay } from 'lodash-es';
import { computed, nextTick, onBeforeUnmount, onMounted, PropType, ref } from 'vue';
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
  searchValue: {
    type: String
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
  },
  searchArea: {
    type: String as PropType<SelectSearchArea>,
    default: SelectSearchArea.default
  }
};

export function relationSelectSetup(props, multi?: boolean) {
  const selectRef = ref();
  const dropdownInputRef = ref();
  const dropdownOpen = ref(false);
  const innerReadonly = computed(() => BooleanHelper.toBoolean(props.readonly));

  const innerDisabled = computed(() => BooleanHelper.toBoolean(props.disabled));

  const selectShowSearch = computed(() => props.showSearch && props.searchArea === SelectSearchArea.default);

  const inputShowSearch = computed(() => props.showSearch && props.searchArea === SelectSearchArea.dropdown);

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

  const innerChange = (e) => {
    if (props.change) {
      props.change(e);
    }

    selectRef.value.focus();
  };

  let focusSearchInput = false;

  const dropdownVisibleChange = (val: boolean) => {
    if (focusSearchInput) {
      return;
    }
    if (props.showSearch && props.searchArea === SelectSearchArea.dropdown) {
      // 延迟响应下拉框显隐状态值，保证在键盘按下Enter时可以正常判断
      nextTick(() => {
        dropdownOpen.value = val;
        props.dropdownVisibleChange(val);
        if (val) {
          delay(() => {
            dropdownInputRef.value?.focus();
            focusSearchInput = true;
          }, 200);
        } else if (!multi) {
          props.blur?.();
        }
      });
    } else {
      // 延迟响应下拉框显隐状态值，保证在键盘按下Enter时可以正常判断
      nextTick(() => {
        dropdownOpen.value = val;
        props.dropdownVisibleChange(val);
      });
    }
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

  const onKeydown = (e: KeyboardEvent) => {
    // 当键盘数据提交快捷键与下拉框内置选中快捷键冲突时，保证行内编辑态不丢失
    if (e.key === 'Enter' && e.key === props.tableKeyboardConfig?.enter?.key && dropdownOpen.value) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onBlur = (e) => {
    if (focusSearchInput) {
      return;
    }
    props.blur?.(e);
  };

  const onFocusInputSearch = (e) => {
    focusSearchInput = true;
  };

  const onBlurInputSearch = (e) => {
    if (focusSearchInput) {
      focusSearchInput = false;
      if (!multi) {
        dropdownVisibleChange(false);
      }
    }
  };

  const onGlobalMouseDown = (e: MouseEvent) => {
    focusSearchInput = e.target === dropdownInputRef.value?.originInput?.input;
  };

  onMounted(() => {
    window.addEventListener('mousedown', onGlobalMouseDown, true);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('mousedown', onGlobalMouseDown);
  });

  return {
    placeholder,
    innerReadonly,
    innerDisabled,
    selectShowSearch,
    inputShowSearch,
    selectRef,
    currentValue,
    dropdownOpen,
    dropdownInputRef,
    innerChange,
    innerSelect,
    slipSelect,
    dropdownVisibleChange,
    onKeydown,
    onBlur,
    onFocusInputSearch,
    onBlurInputSearch
  };
}

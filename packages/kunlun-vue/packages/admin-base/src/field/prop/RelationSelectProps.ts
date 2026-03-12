import { SelectSearchArea } from '@oinone/kunlun-engine';
import { BooleanHelper } from '@oinone/kunlun-shared';
import { debounce, delay } from 'lodash-es';
import { computed, nextTick, onBeforeUnmount, onMounted, type PropType, ref } from 'vue';
import { usePlaceholderProps } from '../../basic';
import { useSelectId } from '../../components';

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
  const id = useSelectId();

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

  /**
   * 在单选状态，下拉框聚焦时，点击回车会出现调用两次 onDropdownVisibleChange 方法的现象
   * 该计时器用于判定此时是否正处于回车事件，且需要进行数据提交的情况
   * 如果在计时器创建后立即关闭，则认为此时正处于回车事件，需要进行数据提交
   */
  let t;

  const dropdownVisibleChange = (val: boolean) => {
    if (props.showSearch && props.searchArea === SelectSearchArea.dropdown) {
      if (focusSearchInput) {
        return;
      }
      if (!focusSearchInput && !val && !multi && dropdownOpen.value) {
        // 按下 Enter 时，下拉单选框无法正常展开，此时进行数据提交
        dropdownOpen.value = false;
        selectRef.value.focus();
        return;
      }
      if (val) {
        // 延迟响应下拉框显隐状态值，保证在键盘按下Enter时可以正常判断
        t = setTimeout(() => {
          dropdownOpen.value = true;
          props.dropdownVisibleChange(true);
          focusSearchInput = true;
          delay(() => {
            dropdownInputRef.value?.focus();
          }, 200);
          clearTimeout(t);
          t = null;
        });
      } else if (t != null) {
        clearTimeout(t);
        t = null;
      } else {
        dropdownOpen.value = false;
        props.dropdownVisibleChange(false);
        if (!multi) {
          selectRef.value.focus();
        }
      }
    } else if (val) {
      t = setTimeout(() => {
        dropdownOpen.value = true;
        props.dropdownVisibleChange(true);
        clearTimeout(t);
        t = null;
      });
    } else if (t != null) {
      clearTimeout(t);
      t = null;
    } else {
      nextTick(() => {
        dropdownOpen.value = false;
        props.dropdownVisibleChange(false);
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
      if (!multi) {
        focusSearchInput = false;
        dropdownOpen.value = false;
        props.dropdownVisibleChange(false);
        selectRef.value.focus();
      }
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onFocus = (e) => {
    props.focus?.(e);
  };

  const onBlur = (e) => {
    if (focusSearchInput) {
      return;
    }
    props.blur?.(e);
  };

  const onSearch = debounce(async (val: string) => {
    await props.search?.(val);
  }, 10);

  const search = (val: string) => {
    onSearch(val);
  };

  const onSearchInputFocus = (e) => {
    focusSearchInput = true;
  };

  const onSearchInputBlur = (e) => {
    if (focusSearchInput) {
      focusSearchInput = false;
      if (!multi) {
        dropdownVisibleChange(false);
      }
    }
  };

  const onSearchInputKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Backspace') {
      e.stopPropagation();
    }
  };

  const $$onClear = () => {
    props.change?.(null);
    props.search?.('');
  };

  const onGlobalMouseDown = (e: MouseEvent) => {
    let antSelectClearDom: HTMLElement | undefined;
    let target = e.target as HTMLElement | null | undefined;
    if (target) {
      for (let i = 0; i < 5; i++) {
        if (target.nodeType && target.classList.contains('ant-select-clear')) {
          antSelectClearDom = target;
          break;
        }
        target = target.parentElement;
        if (!target) {
          break;
        }
      }
    }
    if (
      antSelectClearDom &&
      document
        .querySelector(`#${id}`)
        ?.parentElement?.parentElement?.parentElement?.getElementsByClassName('ant-select-clear')
        .item(0) === antSelectClearDom
    ) {
      e.preventDefault();
      e.stopPropagation();
      $$onClear();
    }
    focusSearchInput = e.target === dropdownInputRef.value?.originInput?.input;
  };

  onMounted(() => {
    window.addEventListener('mousedown', onGlobalMouseDown, true);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('mousedown', onGlobalMouseDown);
  });

  return {
    id,
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
    onFocus,
    onBlur,
    search,
    onSearchInputFocus,
    onSearchInputBlur,
    onSearchInputKeydown
  };
}

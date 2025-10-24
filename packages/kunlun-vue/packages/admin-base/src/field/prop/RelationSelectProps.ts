import { BooleanHelper } from '@oinone/kunlun-shared';
import { computed, nextTick, onBeforeMount, onBeforeUnmount, PropType, ref } from 'vue';
import { SelectSearchArea, usePlaceholderProps } from '../../basic';

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

export function relationSelectSetup(props) {
  // 记录鼠标按下的元素
  let mouseDownEventTarget: EventTarget | null = null;

  const selectRef = ref();
  const dropdownInputRef = ref();
  const dropdownOpen = ref(false);
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

  const onGlobalMouseDown = (event: MouseEvent) => {
    mouseDownEventTarget = event.target;
  };

  const innerChange = (e) => {
    if (props.change) {
      props.change(e);
    }

    selectRef.value.focus();
  };

  const dropdownVisibleChange = (val: boolean) => {
    // 延迟响应下拉框显隐状态值，保证在键盘按下Enter时可以正常判断
    nextTick(() => {
      dropdownOpen.value = val;
      props.dropdownVisibleChange(val);
    });
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

  onBeforeMount(() => {
    window.addEventListener('mousedown', onGlobalMouseDown);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('mousedown', onGlobalMouseDown);
  });

  return {
    SelectSearchArea,
    placeholder,
    innerReadonly,
    innerDisabled,
    selectRef,
    currentValue,
    dropdownOpen,
    dropdownInputRef,
    innerChange,
    innerSelect,
    slipSelect,
    dropdownVisibleChange,
    onKeydown
  };
}

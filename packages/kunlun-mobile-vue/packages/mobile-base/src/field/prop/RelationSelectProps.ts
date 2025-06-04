import { BooleanHelper } from '@oinone/kunlun-shared';
import { DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';
import { computed, PropType, ref, watch } from 'vue';
import { isNil } from 'lodash-es';
import { OioMetadataProps } from '../../basic';

export const RelationSelectProps = {
  ...OioMetadataProps,
  dropdownClassName: {
    type: String,
    default: `${DEFAULT_PREFIX}-select-dropdown ${DEFAULT_PREFIX}form-relation-select-dropdown`
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
  selectedOptions: {
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
  allowSelectAll: {
    type: Boolean,
    default: false
  },
  generatorSelectOption: {
    type: Function
  }
};

export function relationSelectSetup(props) {
  const innerReadonly = computed(() => BooleanHelper.toBoolean(props.readonly));

  const innerDisabled = computed(() => BooleanHelper.toBoolean(props.disabled));

  const currentValue = computed(() => {
    if (!props.isInitOptions) {
      return undefined;
    }
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

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    selectRef.value && selectRef.value.focus && selectRef.value.focus();
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

  const loadMoreHandle = () => {
    props.loadMore();
  };

  const optionList = ref<Record<string, unknown>[]>([]);
  const getOptionList = (options: Record<string, unknown>[]) => {
    optionList.value = [...options];
  };

  watch(
    () => props.options,
    () => {
      if (props.options && props.options.length) {
        getOptionList((props.options || []).filter((o) => !isNil(o.value)));
      } else {
        optionList.value = [];
      }
    },
    { immediate: true }
  );

  watch(
    () => props.value,
    () => {
      if (!props.isInitOptions && props.value) {
        getOptionList(props.generatorSelectOption?.(Array.isArray(props.value) ? props.value : [props.value]) || []);
      }
    },
    { immediate: true }
  );

  return {
    innerReadonly,
    innerDisabled,
    selectRef,
    currentValue,
    optionList,
    innerChange,
    innerSelect,
    slipSelect,
    loadMoreHandle
  };
}

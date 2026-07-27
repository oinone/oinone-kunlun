<template>
  <div class="form-single-select" @mousedown.capture="onSelectWrapperMouseDown">
    <div class="readonly" v-if="readonly && !disabled">
      <oio-select
        :value="realValue"
        :options="realOptions"
        :properties="properties"
        :placeholder="placeholder"
        :get-trigger-container="getTriggerContainer"
      />
    </div>
    <oio-select
      v-else
      dropdownClassName="oio-ant-select-dropdown-global"
      show-search
      :value="realValue"
      :dropdown-visible="dropdownVisible"
      :options="realOptions"
      :properties="properties"
      :get-trigger-container="getTriggerContainer"
      :allowClear="allowClear"
      :filter-option="filterOption"
      :not-found-content="null"
      :default-active-first-option="false"
      :disabled="disabled"
      :placeholder="placeholder"
      @update:dropdown-visible="onUpdateDropdownVisible"
      @change="selectChange"
      @blur="blur"
      @focus="focus"
      @keydown="onKeydown"
    />
  </div>
</template>
<script lang="ts">
import type { RuntimeEnumerationOption, TableKeyboardConfig } from '@oinone/kunlun-engine';
import {
  defaultSelectProperties,
  OioSelect,
  SelectItem,
  useInjectOioDefaultFormContext
} from '@oinone/kunlun-vue-ui-antd';
import { computed, defineComponent, nextTick, type PropType, ref } from 'vue';
import { OioCommonProps, OioMetadataProps, useMetadataProps } from '../../../../../basic';
import { optionsConvertSelectItem } from '../../../../util';

export default defineComponent({
  components: {
    OioSelect
  },
  inheritAttrs: false,
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [String, Boolean, Object],
      default: undefined
    },
    defaultValue: {
      type: [String, Boolean, Object],
      default: undefined
    },
    options: {
      type: Array as PropType<RuntimeEnumerationOption[]>
    },
    allowClear: {
      type: Boolean
    },
    placeholder: {
      type: String
    },
    tableKeyboardConfig: {
      type: Object as PropType<TableKeyboardConfig>
    }
  },
  setup(props) {
    const { realValue, readonly, disabled, placeholder } = useMetadataProps(props);

    const dropdownVisible = ref(false);

    const realOptions = computed<SelectItem<RuntimeEnumerationOption>[]>(() =>
      optionsConvertSelectItem(props.options).map((opt) => {
        return {
          ...opt,
          disabled: opt.disabled ? realValue.value !== opt.value : false
        };
      })
    );

    const formContext = useInjectOioDefaultFormContext();

    const selectChange = (val: SelectItem) => {
      if (props.change) {
        props.change(val ? val.key : null);
      }
      props.blur && props.blur();
    };

    const clearSelectValue = () => {
      realValue.value = undefined;
      props.change?.(null);
    };

    const filterOption = (val: string, option: SelectItem) => {
      return option.label.includes(val);
    };

    /**
     * 在单选状态，下拉框聚焦时，点击回车会出现调用两次 onDropdownVisibleChange 方法的现象
     * 该计数器用于判定此时是否正处于回车事件，且需要进行数据提交的情况
     */
    let count = 0;

    const onUpdateDropdownVisible = (val: boolean) => {
      if (val) {
        if (count === 0) {
          count++;
          setTimeout(() => (count = 0));
        }
        dropdownVisible.value = true;
      } else {
        if (count === 1) {
          count++;
        }
        nextTick(() => {
          dropdownVisible.value = false;
        });
      }
    };

    const onKeydown = (e: KeyboardEvent) => {
      // 当键盘数据提交快捷键与下拉框内置选中快捷键冲突时，保证行内编辑态不丢失
      if (e.key === 'Enter' && e.key === props.tableKeyboardConfig?.enter?.key) {
        if (dropdownVisible.value) {
          if (count === 2) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    const onSelectWrapperMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const clearDom = target?.closest('.ant-select-clear');
      if (clearDom) {
        e.preventDefault();
        e.stopPropagation();
        clearSelectValue();
      }
    };

    return {
      placeholder,
      properties: defaultSelectProperties,
      realValue,
      readonly,
      disabled,
      dropdownVisible,
      realOptions,
      selectChange,
      filterOption,
      getTriggerContainer: props.getPopupContainer || formContext.getTriggerContainer,
      onUpdateDropdownVisible,
      onKeydown,
      onSelectWrapperMouseDown
    };
  }
});
</script>

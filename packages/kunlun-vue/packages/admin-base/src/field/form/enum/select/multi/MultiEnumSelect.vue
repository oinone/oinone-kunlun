<template>
  <div class="form-multi-select" :class="[!allowClear && 'hide-clear']">
    <div :class="readonly && !disabled && 'readonly'">
      <a-select
        ref="selectRef"
        class="oio-select"
        mode="multiple"
        dropdownClassName="oio-select-dropdown"
        :placeholder="placeholder"
        :allowClear="allowClear"
        :open="dropdownOpen"
        max-tag-count="responsive"
        :max-tag-placeholder="defaultMaxTagPlaceholder"
        :filter-option="false"
        :not-found-content="null"
        :default-active-first-option="false"
        :value="realValue === null ? undefined : realValue"
        :disabled="readonly && !disabled ? false : disabled"
        :get-popup-container="getPopupContainer"
        @change="multiSelectChange"
        @blur="blur"
        @dropdownVisibleChange="dropdownVisibleChange"
        @keydown="onKeydown"
      >
        <a-select-option
          v-for="item in realOptions"
          :disabled="item.disabled && !(realValue && realValue.includes(item.value))"
          :key="item.key"
          :value="item.value"
        >
          {{ item.label }}
        </a-select-option>
      </a-select>
    </div>
  </div>
</template>
<script lang="ts">
import { RuntimeEnumerationOption, TableKeyboardConfig } from '@oinone/kunlun-engine';
import { useMaxTagPlaceholder } from '@oinone/kunlun-vue-ui-antd';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { Select as ASelect } from 'ant-design-vue';
import { computed, defineComponent, nextTick, PropType, ref } from 'vue';
import {
  OioCommonProps,
  OioMetadataProps,
  useInjectOioDefaultFormContext,
  useMetadataProps
} from '../../../../../basic';
import { optionsConvertSelectItem } from '../../../../util';

export default defineComponent({
  inheritAttrs: false,
  components: {
    ASelect,
    ASelectOption: ASelect.Option
  },
  props: {
    ...OioCommonProps,
    ...OioMetadataProps,
    value: {
      type: [String, Array] as PropType<string | string[]>
    },
    defaultValue: {
      type: [String, Array] as PropType<string | string[]>
    },
    options: {
      type: Array as PropType<RuntimeEnumerationOption[]>
    },
    placeholder: {
      type: String
    },
    allowClear: {
      type: Boolean
    },
    tableKeyboardConfig: {
      type: Object as PropType<TableKeyboardConfig>
    }
  },
  setup(props) {
    const { realValue, readonly, disabled, placeholder } = useMetadataProps(props);

    const realOptions = computed<SelectItem<RuntimeEnumerationOption>[]>(() => optionsConvertSelectItem(props.options));

    const formContext = useInjectOioDefaultFormContext();

    const selectRef = ref();

    const dropdownOpen = ref(false);

    const multiSelectChange = (val) => {
      realValue.value = val;
      if (props.change) {
        props.change(val);
      }
      selectRef.value.focus();
    };

    const dropdownVisibleChange = (val: boolean) => {
      // 延迟响应下拉框显隐状态值，保证在键盘按下Enter时可以正常判断
      nextTick(() => {
        dropdownOpen.value = val;
      });
    };

    const onKeydown = (e: KeyboardEvent) => {
      // 当键盘数据提交快捷键与下拉框内置选中快捷键冲突时，保证行内编辑态不丢失
      if (e.key === 'Enter' && e.key === props.tableKeyboardConfig?.enter?.key && dropdownOpen.value) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    return {
      ...useMaxTagPlaceholder(),
      placeholder,
      realValue,
      readonly,
      disabled,
      dropdownOpen,
      realOptions,
      selectRef,
      multiSelectChange,
      getPopupContainer: props.getPopupContainer || formContext.getTriggerContainer,
      dropdownVisibleChange,
      onKeydown
    };
  }
});
</script>

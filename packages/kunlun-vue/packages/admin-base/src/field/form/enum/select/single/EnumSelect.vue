<template>
  <div class="form-single-select">
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
import { RuntimeEnumerationOption, TableKeyboardConfig } from '@oinone/kunlun-engine';
import { defaultSelectProperties, OioSelect, SelectItem } from '@oinone/kunlun-vue-ui-antd';
import { delay } from 'lodash-es';
import { computed, defineComponent, nextTick, PropType, ref } from 'vue';
import {
  OioCommonProps,
  OioMetadataProps,
  useInjectOioDefaultFormContext,
  useMetadataProps
} from '../../../../../basic';
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

    const filterOption = (val: string, option: SelectItem) => {
      return option.label.includes(val);
    };

    let focusSearchInput = false;

    const onUpdateDropdownVisible = (val: boolean) => {
      if (!focusSearchInput && !val && dropdownVisible.value) {
        // 按下 Enter 时，下拉单选框无法正常展开，此时进行数据提交
        dropdownVisible.value = false;
        return;
      }
      // 延迟响应下拉框显隐状态值，保证在键盘按下Enter时可以正常判断
      nextTick(() => {
        dropdownVisible.value = val;
        if (val) {
          delay(() => {
            focusSearchInput = true;
          }, 200);
        }
      });
    };

    const onKeydown = (e: KeyboardEvent) => {
      // 当键盘数据提交快捷键与下拉框内置选中快捷键冲突时，保证行内编辑态不丢失
      if (e.key === 'Enter' && e.key === props.tableKeyboardConfig?.enter?.key && dropdownVisible.value) {
        e.preventDefault();
        e.stopPropagation();
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
      onKeydown
    };
  }
});
</script>

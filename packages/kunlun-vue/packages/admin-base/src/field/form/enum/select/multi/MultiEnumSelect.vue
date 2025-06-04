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
        :filter-option="false"
        :not-found-content="null"
        :default-active-first-option="false"
        :value="realValue"
        :disabled="readonly && !disabled ? false : disabled"
        :get-popup-container="getPopupContainer"
        @change="multiSelectChange"
        @blur="blur"
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
import { RuntimeEnumerationOption } from '@oinone/kunlun-engine';
import { SelectItem } from '@oinone/kunlun-vue-ui-common';
import { computed, defineComponent, PropType, ref } from 'vue';
import { Select as ASelect } from 'ant-design-vue';
import {
  OioCommonProps,
  OioMetadataProps,
  useInjectOioDefaultFormContext,
  useMetadataProps
} from '../../../../../basic';
import { optionsConvertSelectItem } from '../../../../util';

export default defineComponent({
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
    }
  },
  components: {
    ASelect,
    ASelectOption: ASelect.Option
  },
  setup(props) {
    const { realValue, readonly, disabled, placeholder } = useMetadataProps(props);

    const realOptions = computed<SelectItem<RuntimeEnumerationOption>[]>(() => optionsConvertSelectItem(props.options));

    const formContext = useInjectOioDefaultFormContext();

    const selectRef = ref();

    const multiSelectChange = (val) => {
      realValue.value = val;
      if (props.change) {
        props.change(val);
      }
      selectRef.value.focus();
    };
    return {
      placeholder,
      realValue,
      readonly,
      disabled,
      realOptions,
      selectRef,
      multiSelectChange,
      getPopupContainer: props.getPopupContainer || formContext.getTriggerContainer
    };
  }
});
</script>

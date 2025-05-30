<template>
  <oio-date-picker
    :value="realValue"
    :format="format"
    :date-format="dateFormat"
    :value-format="valueFormat"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    :readonly="readonly"
    :show-today="false"
    :disabled="disabled"
    :disabled-date="disabledDate"
    :open="open"
    :change-open-value="changeOpenValue"
    :get-trigger-container="getTriggerContainer"
    dropdown-class-name="vxe-table--ignore-clear"
    @update:value="change"
    @blur="blur"
    @focus="focus"
  >
    <template v-if="quickOptions && quickOptions.length" #renderExtraFooter>
      <div class="date-quick-options">
        <div
          v-for="item in quickOptions"
          :class="['date-quick-options-label', quickOptionsCompareDisable(item) && 'disabled']"
          :key="item"
          @click="quickChange(item)"
        >
          {{ DateQuickOptionListMap.get(item).label }}
        </div>
      </div>
    </template>
  </oio-date-picker>
</template>
<script lang="ts">
import { OioDatePicker } from '@kunlun/vue-ui-antd';
import { OioDatePickerProps } from '@kunlun/vue-ui-common';
import { defineComponent, PropType } from 'vue';
import { OioCommonProps, OioMetadataProps, useInjectOioDefaultFormContext } from '../../../basic';
import { useDateTimePickerProps } from './use-date-time-picker-props';
import { DateQuickOption } from './date-common';

export default defineComponent({
  name: 'DefaultDatePicker',
  components: {
    OioDatePicker
  },
  inheritAttrs: false,
  props: {
    ...OioDatePickerProps,
    ...OioCommonProps,
    ...OioMetadataProps,
    quickOptions: {
      type: Array as PropType<DateQuickOption[]>
    },
    quickChange: {
      type: Function
    },
    quickOptionsCompareDisable: {
      type: Function
    }
  },
  setup(props) {
    const formContext = useInjectOioDefaultFormContext();

    return {
      ...useDateTimePickerProps(props),
      getTriggerContainer: props.getPopupContainer || formContext.getTriggerContainer
    };
  }
});
</script>
<style lang="scss">
.date-quick-options {
  display: flex;
  justify-content: flex-end;
  flex-direction: row-reverse;

  .date-quick-options-label {
    margin-left: 8px;
    color: var(--oio-primary-color);
    cursor: pointer;

    &.disabled {
      color: var(--oio-disabled-color);
      pointer-events: none;
      cursor: not-allowed;
    }
  }
}
</style>

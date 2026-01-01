<template>
  <default-form-item
    :class="$attrs.class"
    :style="$attrs.style"
    :name="itemName"
    :invisible="invisible"
    :colon="colon"
    :layout="layout"
    :label="label"
    :help="help"
    :hint="hint"
    :required="required"
    :validate-trigger="validateTrigger"
    :validator-info="validatorInfo"
  >
    <oio-date-time-range-picker
      :value="realValue"
      :default-value="defaultValue"
      :format="format"
      :date-format="dateFormat"
      :time-format="timeFormat"
      :value-format="valueFormat"
      :placeholder="placeholder"
      :allow-clear="allowClear"
      :readonly="readonly"
      :disabled="disabled"
      :close-panel-change="closePanelChange"
      :open-panel-change="openPanelChange"
      :show-time="{ defaultValue: showTimeDefaultValue }"
      :get-trigger-container="getTriggerContainer"
      popper-class="vxe-table--ignore-clear"
      @update:value="change"
      @blur="blur"
      @focus="focus"
    />
  </default-form-item>
</template>
<script lang="ts">
import { OioDateTimeRangePicker, OioDateTimeRangePickerProps, useInjectOioDefaultFormContext } from '@oinone/kunlun-vue-ui-antd';
import type { Moment } from 'moment';
import { defineComponent, type PropType } from 'vue';
import { BaseFormItemProps, DefaultFormItem, OioCommonProps, OioMetadataProps } from '../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from './props';

export default defineComponent({
  name: 'DefaultDateTimeRangePicker',
  components: {
    OioDateTimeRangePicker,
    DefaultFormItem
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimeRangePickerProps,
    ...OioCommonProps,
    ...OioMetadataProps,
    ...BaseFormItemProps,
    ...DefaultDateTimeRangePickerProps,
    showTimeDefaultValue: {
      type: Array as PropType<Moment[]>
    },
    itemName: {
      type: String
    }
  },
  setup(props) {
    const formContext = useInjectOioDefaultFormContext();

    return {
      ...useDateTimeRangePickerProps(props),
      getTriggerContainer: props.getPopupContainer || formContext.getTriggerContainer
    };
  }
});
</script>

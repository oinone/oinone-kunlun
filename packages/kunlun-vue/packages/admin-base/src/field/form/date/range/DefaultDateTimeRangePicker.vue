<template>
  <default-form-item
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
import { OioDateTimeRangePicker } from '@kunlun/vue-ui-antd';
import { OioDateTimeRangePickerProps } from '@kunlun/vue-ui-common';
import { Moment } from 'moment';
import { defineComponent, PropType } from 'vue';
import {
  BaseFormItemProps,
  DefaultFormItem,
  OioCommonProps,
  OioMetadataProps,
  useInjectOioDefaultFormContext
} from '../../../../basic';
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

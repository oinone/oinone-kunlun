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
    <oio-date-range-picker
      :value="realValue"
      :default-value="defaultValue"
      :format="format"
      :date-format="dateFormat"
      :value-format="valueFormat"
      :placeholder="placeholder"
      :allow-clear="allowClear"
      :readonly="readonly"
      :disabled="disabled"
      :close-panel-change="closePanelChange"
      :open-panel-change="openPanelChange"
      :get-trigger-container="getTriggerContainer"
      popper-class="vxe-table--ignore-clear"
      @update:value="change"
      @blur="blur"
      @focus="focus"
    />
  </default-form-item>
</template>
<script lang="ts">
import { OioDateRangePicker } from '@kunlun/vue-ui-antd';
import { OioDateRangePickerProps } from '@kunlun/vue-ui-common';
import { defineComponent } from 'vue';
import {
  BaseFormItemProps,
  DefaultFormItem,
  OioCommonProps,
  OioMetadataProps,
  useInjectOioDefaultFormContext
} from '../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from './props';

export default defineComponent({
  name: 'DefaultDateRangePicker',
  components: {
    OioDateRangePicker,
    DefaultFormItem
  },
  inheritAttrs: false,
  props: {
    ...OioDateRangePickerProps,
    ...OioCommonProps,
    ...OioMetadataProps,
    ...BaseFormItemProps,
    ...DefaultDateTimeRangePickerProps,
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

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
    <oio-year-range-picker
      :value="realValue"
      :default-value="defaultValue"
      :format="format"
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
import { OioYearRangePicker } from '@oinone/kunlun-vue-ui-antd';
import { OioYearRangePickerProps } from '@oinone/kunlun-vue-ui-common';
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
  name: 'DefaultYearRangePicker',
  components: {
    OioYearRangePicker,
    DefaultFormItem
  },
  inheritAttrs: false,
  props: {
    ...OioYearRangePickerProps,
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

<template>
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
    @update:value="change"
    @blur="blur"
    @focus="focus"
  />
</template>
<script lang="ts">
import { OioDateTimeRangePicker, OioDateTimeRangePickerProps, useInjectOioDefaultFormContext } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent } from 'vue';
import { BaseFormItemProps, DefaultFormItem, OioCommonProps, OioMetadataProps } from '../../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from '../../../../form/date/range/props';

export default defineComponent({
  name: 'DefaultEditorDateTimeRangePicker',
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
    ...DefaultDateTimeRangePickerProps
  },
  setup(props) {
    const formContext = useInjectOioDefaultFormContext();

    return {
      ...useDateTimeRangePickerProps(props),
      getTriggerContainer: formContext.getTriggerContainer
    };
  }
});
</script>

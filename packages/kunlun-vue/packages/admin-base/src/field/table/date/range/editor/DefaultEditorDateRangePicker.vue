<template>
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
    @update:value="change"
    @blur="blur"
    @focus="focus"
  />
</template>
<script lang="ts">
import { OioDateRangePicker, OioDateRangePickerProps, useInjectOioDefaultFormContext } from '@oinone/kunlun-vue-ui-antd';
import { defineComponent } from 'vue';
import { BaseFormItemProps, DefaultFormItem, OioCommonProps, OioMetadataProps } from '../../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from '../../../../form/date/range/props';

export default defineComponent({
  name: 'DefaultEditorDateRangePicker',
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

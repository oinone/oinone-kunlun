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
import { OioDateRangePicker } from '@oinone/kunlun-vue-ui-antd';
import { OioDateRangePickerProps } from '@oinone/kunlun-vue-ui-common';
import { defineComponent } from 'vue';
import {
  DefaultFormItem,
  BaseFormItemProps,
  OioCommonProps,
  OioMetadataProps,
  useInjectOioDefaultFormContext
} from '../../../../../basic';
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

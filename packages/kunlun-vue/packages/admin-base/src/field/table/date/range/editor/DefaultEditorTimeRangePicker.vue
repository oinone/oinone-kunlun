<template>
  <oio-time-range-picker
    :value="realValue"
    :default-value="defaultValue"
    :format="format"
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
import { OioTimeRangePicker } from '@kunlun/vue-ui-antd';
import { OioTimeRangePickerProps } from '@kunlun/vue-ui-common';
import { defineComponent } from 'vue';
import {
  BaseFormItemProps,
  DefaultFormItem,
  OioCommonProps,
  OioMetadataProps,
  useInjectOioDefaultFormContext
} from '../../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from '../../../../form/date/range/props';

export default defineComponent({
  name: 'DefaultEditorTimeRangePicker',
  components: {
    OioTimeRangePicker,
    DefaultFormItem
  },
  inheritAttrs: false,
  props: {
    ...OioTimeRangePickerProps,
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

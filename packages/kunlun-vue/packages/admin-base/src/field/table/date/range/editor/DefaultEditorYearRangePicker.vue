<template>
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
    @update:value="change"
    @blur="blur"
    @focus="focus"
  />
</template>
<script lang="ts">
import { OioYearRangePicker } from '@kunlun/vue-ui-antd';
import { OioYearRangePickerProps } from '@kunlun/vue-ui-common';
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
  name: 'DefaultEditorYearRangePicker',
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

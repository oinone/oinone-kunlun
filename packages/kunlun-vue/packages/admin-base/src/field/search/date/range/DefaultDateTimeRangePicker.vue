<template>
  <oio-date-time-picker
    v-if="isSingle"
    :value="realValue"
    :format="format"
    :date-format="dateFormat"
    :value-format="valueFormat"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    :readonly="readonly"
    :disabled="disabled"
    @update:value="change"
    @blur="blur"
    @focus="focus"
  />
  <oio-date-time-range-picker
    v-else
    :value="realValue"
    :format="format"
    :date-format="dateFormat"
    :time-format="timeFormat"
    :value-format="valueFormat"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    :readonly="readonly"
    :disabled="disabled"
    @update:value="change"
    @blur="blur"
    @focus="focus"
  />
</template>
<script lang="ts">
import { OioDateTimePicker, OioDateTimeRangePicker } from '@kunlun/vue-ui-antd';
import { OioDateTimeRangePickerProps } from '@kunlun/vue-ui-common';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from '../../../form/date/range/props';

export default defineComponent({
  name: 'DefaultDateTimeRangePicker',
  components: {
    OioDateTimePicker,
    OioDateTimeRangePicker
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimeRangePickerProps,
    ...OioCommonProps,
    ...OioMetadataProps,
    ...DefaultDateTimeRangePickerProps
  },
  setup(props) {
    return {
      ...useDateTimeRangePickerProps(props)
    };
  }
});
</script>

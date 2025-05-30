<template>
  <oio-time-picker
    v-if="isSingle"
    :value="realValue"
    :format="format"
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
  <oio-time-range-picker
    v-else
    :value="realValue"
    :format="format"
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
import { OioTimePicker, OioTimeRangePicker } from '@kunlun/vue-ui-antd';
import { OioTimeRangePickerProps } from '@kunlun/vue-ui-common';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from '../../../form/date/range/props';

export default defineComponent({
  name: 'DefaultTimeRangePicker',
  components: {
    OioTimePicker,
    OioTimeRangePicker
  },
  inheritAttrs: false,
  props: {
    ...OioTimeRangePickerProps,
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

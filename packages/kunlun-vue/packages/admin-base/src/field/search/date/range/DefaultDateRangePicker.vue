<template>
  <oio-date-picker
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
  <oio-date-range-picker
    v-else
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
</template>
<script lang="ts">
import { OioDatePicker, OioDateRangePicker } from '@kunlun/vue-ui-antd';
import { OioDateRangePickerProps } from '@kunlun/vue-ui-common';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from '../../../form/date/range/props';

export default defineComponent({
  name: 'DefaultDateRangePicker',
  components: {
    OioDatePicker,
    OioDateRangePicker
  },
  inheritAttrs: false,
  props: {
    ...OioDateRangePickerProps,
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

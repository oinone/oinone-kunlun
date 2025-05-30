<template>
  <oio-year-picker
    v-if="isSingle"
    :value="realValue"
    :format="format"
    :value-format="valueFormat"
    :placeholder="placeholder"
    :allow-clear="allowClear"
    :readonly="readonly"
    :disabled="disabled"
    @update:value="change"
    @blur="blur"
    @focus="focus"
  />
  <oio-year-range-picker
    v-else
    :value="realValue"
    :format="format"
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
import { OioYearPicker, OioYearRangePicker } from '@kunlun/vue-ui-antd';
import { OioYearRangePickerProps } from '@kunlun/vue-ui-common';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from '../../../form/date/range/props';

export default defineComponent({
  name: 'DefaultYearRangePicker',
  components: {
    OioYearPicker,
    OioYearRangePicker
  },
  inheritAttrs: false,
  props: {
    ...OioYearRangePickerProps,
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

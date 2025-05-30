<template>
  <van-config-provider>
    <oio-year-range-picker
      :title="fieldLabel"
      :value="realValue"
      :default-value="defaultValue"
      :format="format"
      :value-format="valueFormat"
      :placeholder="readonly || disabled ? '' : placeholder"
      :allow-clear="allowClear"
      :readonly="readonly"
      :disabled="disabled"
      @update:value="change"
      @blur="blur"
      @focus="focus"
    />
  </van-config-provider>
</template>
<script lang="ts">
import { OioYearRangePicker } from '@kunlun/vue-ui-mobile-vant';
import { OioYearRangePickerProps } from '@kunlun/vue-ui-common';
import { ConfigProvider as VanConfigProvider } from 'vant';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from '../../../form/date/range/props';

export default defineComponent({
  name: 'DefaultYearRangePicker',
  components: {
    OioYearRangePicker,
    VanConfigProvider
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

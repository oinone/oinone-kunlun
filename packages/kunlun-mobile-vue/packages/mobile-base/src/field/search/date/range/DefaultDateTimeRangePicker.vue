<template>
  <van-config-provider>
    <oio-date-time-range-picker
      :title="fieldLabel"
      :value="realValue"
      :default-value="defaultValue"
      :format="format"
      :date-format="dateFormat"
      :time-format="timeFormat"
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
import { OioDateTimeRangePicker } from '@oinone/kunlun-vue-ui-mobile-vant';
import { OioDateTimeRangePickerProps } from '@oinone/kunlun-vue-ui-common';
import { ConfigProvider as VanConfigProvider } from 'vant';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from '../../../form/date/range/props';

export default defineComponent({
  name: 'DefaultDateTimeRangePicker',
  components: {
    OioDateTimeRangePicker,
    VanConfigProvider
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

<template>
  <van-config-provider>
    <oio-date-range-picker
      :title="fieldLabel"
      :value="realValue"
      :default-value="defaultValue"
      :format="format"
      :date-format="dateFormat"
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
import { OioDateRangePicker } from '@oinone/kunlun-vue-ui-mobile-vant';
import { OioDateRangePickerProps } from '@oinone/kunlun-vue-ui-common';
import { ConfigProvider as VanConfigProvider } from 'vant';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../../basic';
import { DefaultDateTimeRangePickerProps, useDateTimeRangePickerProps } from '../../../form/date/range/props';

export default defineComponent({
  name: 'DefaultDateRangePicker',
  components: {
    OioDateRangePicker,
    VanConfigProvider
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

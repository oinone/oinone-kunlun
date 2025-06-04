<template>
  <van-config-provider>
    <oio-date-time-picker
      :value="realValue"
      :default-value="defaultValue"
      :format="format"
      :date-format="dateFormat"
      :time-format="timeFormat"
      :value-format="valueFormat"
      :placeholder="placeholder"
      :allow-clear="allowClear"
      :readonly="readonly"
      :disabled="disabled"
      :title="fieldLabel"
      :minDate="minDate"
      :maxDate="maxDate"
      @update:value="change"
      @blur="blur"
      @focus="focus"
    />
  </van-config-provider>
</template>
<script lang="ts">
import { OioDateTimePicker } from '@oinone/kunlun-vue-ui-mobile-vant';
import { OioDateTimePickerProps } from '@oinone/kunlun-vue-ui-common';
import { ConfigProvider as VanConfigProvider } from 'vant';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic';
import { useDateTimePickerProps } from './use-date-time-picker-props';

export default defineComponent({
  name: 'DefaultDateTimePicker',
  components: {
    OioDateTimePicker,
    VanConfigProvider
  },
  inheritAttrs: false,
  props: {
    ...OioDateTimePickerProps,
    ...OioCommonProps,
    ...OioMetadataProps
  },
  setup(props) {
    return {
      ...useDateTimePickerProps(props)
    };
  }
});
</script>

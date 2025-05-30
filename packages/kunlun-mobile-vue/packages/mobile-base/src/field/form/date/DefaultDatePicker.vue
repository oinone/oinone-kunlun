<template>
  <van-config-provider>
    <oio-date-picker
      :value="realValue"
      :default-value="defaultValue"
      :format="format"
      :date-format="dateFormat"
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
import { OioDatePicker } from '@kunlun/vue-ui-mobile-vant';
import { OioDatePickerProps } from '@kunlun/vue-ui-common';
import { ConfigProvider as VanConfigProvider } from 'vant';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic';
import { useDateTimePickerProps } from './use-date-time-picker-props';

export default defineComponent({
  name: 'DefaultDatePicker',
  components: {
    OioDatePicker,
    VanConfigProvider
  },
  inheritAttrs: false,
  props: {
    ...OioDatePickerProps,
    ...OioCommonProps,
    ...OioMetadataProps
  },
  setup(props) {
    return {
      ...useDateTimePickerProps(props),
    };
  }
});
</script>

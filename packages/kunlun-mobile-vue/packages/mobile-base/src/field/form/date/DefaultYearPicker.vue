<template>
  <van-config-provider>
    <oio-year-picker
      :value="realValue"
      :default-value="defaultValue"
      :format="format"
      :value-format="valueFormat"
      :placeholder="placeholder"
      :allow-clear="allowClear"
      :readonly="readonly"
      :disabled="disabled"
      :minDate="minDate"
      :maxDate="maxDate"
      :title="fieldLabel"
      @update:value="change"
      @blur="blur"
      @focus="focus"
    />
  </van-config-provider>
</template>
<script lang="ts">
import { OioYearPicker } from '@oinone/kunlun-vue-ui-mobile-vant';
import { OioYearPickerProps } from '@oinone/kunlun-vue-ui-common';
import { ConfigProvider as VanConfigProvider } from 'vant';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic';
import { useDateTimePickerProps } from './use-date-time-picker-props';

export default defineComponent({
  name: 'DefaultYearPicker',
  components: {
    OioYearPicker,
    VanConfigProvider
  },
  inheritAttrs: false,
  props: {
    ...OioYearPickerProps,
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

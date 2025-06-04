<template>
  <van-config-provider>
    <oio-time-picker
      :value="realValue"
      :default-value="defaultValue"
      :format="format"
      :time-format="timeFormat"
      :value-format="valueFormat"
      :placeholder="placeholder"
      :allow-clear="allowClear"
      :readonly="readonly"
      :disabled="disabled"
      :title="fieldLabel"
      @update:value="change"
      @blur="blur"
      @focus="focus"
    />
  </van-config-provider>
</template>
<script lang="ts">
import { OioTimePicker } from '@oinone/kunlun-vue-ui-mobile-vant';
import { OioTimePickerProps } from '@oinone/kunlun-vue-ui-common';
import { ConfigProvider as VanConfigProvider } from 'vant';
import { defineComponent } from 'vue';
import { OioCommonProps, OioMetadataProps } from '../../../basic';
import { useDateTimePickerProps } from './use-date-time-picker-props';

export default defineComponent({
  name: 'DefaultTimePicker',
  components: {
    OioTimePicker,
    VanConfigProvider
  },
  inheritAttrs: false,
  props: {
    ...OioTimePickerProps,
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

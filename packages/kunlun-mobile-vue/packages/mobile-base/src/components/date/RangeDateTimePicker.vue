<template>
  <van-config-provider>
    <van-range-picker :class="`${DEFAULT_PREFIX}-date-time-range-picker`" :value="dateValue" @change="onChange" />
  </van-config-provider>
</template>
<script lang="ts">
import { ConfigProvider as VanConfigProvider, DatePicker as VanRangePicker } from 'vant';
// fixme @zbh 20251226 PickerGroup as VanPickerGroup
import { defineComponent, PropType } from 'vue';
import { DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';

export default defineComponent({
  components: {
    VanRangePicker,
    VanConfigProvider
  },
  inheritAttrs: false,
  props: {
    dateValue: {
      type: Object as PropType<string[]>
    },
    value: {
      type: String
    },
    onChange: {
      type: Function
    }
  },
  setup() {
    return { DEFAULT_PREFIX };
  }
});
</script>

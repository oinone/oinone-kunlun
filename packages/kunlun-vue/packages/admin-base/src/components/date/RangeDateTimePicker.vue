<template>
  <a-range-picker class="oio-date-time-range-picker" :value="dateValue" @change="onChange" />
</template>
<script lang="ts">
import { RangePicker as ARangePicker } from 'ant-design-vue';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  components: {
    ARangePicker
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
    return {};
  }
});
</script>

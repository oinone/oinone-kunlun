<template>
  <oio-select
    :options="options"
    :value="value"
    @change="change"
  >
  </oio-select>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { OioSelect } from '@kunlun/vue-ui-mobile-vant';

export default defineComponent({
  components: {
    OioSelect
  },
  props: {
    options: {
      type: Array,
      required: true,
      default: () => []
    },
    value: {
      type: Boolean
    },
    change: {
      type: Function,
      required: true
    }
  }
});
</script>

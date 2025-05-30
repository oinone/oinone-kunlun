<template>
  <div class="mobile-default-table-color-picker">
    <oio-color-preview v-if="value" :value="value" />
  </div>
</template>
<script lang="ts">
import { OioColorPreview } from '@kunlun/vue-ui-mobile-vant';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DefaultColorPicker',
  inheritAttrs: false,
  props: {
    value: {
      type: String
    }
  },
  components: {
    OioColorPreview
  },
  setup(props) {
    return {};
  }
});
</script>

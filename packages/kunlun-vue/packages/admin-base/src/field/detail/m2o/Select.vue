<template>
  <detail-common-field :value="currentValue ? currentValue.label : undefined" :empty-style="emptyStyle" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import DetailCommonField from '../common/DetailCommonField.vue';

export default defineComponent({
  props: {
    currentValue: {
      type: Object
    },
    emptyStyle: {
      type: String
    }
  },
  components: { DetailCommonField },
  inheritAttrs: false
});
</script>

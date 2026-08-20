<template>
  <detail-common-field
    :value="currentValue ? currentValue.label : undefined"
    :empty-style="emptyStyle"
    :wrapperToFieldAction="wrapperToFieldAction"
  />
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
    },
    wrapperToFieldAction: {
      type: Function
    }
  },
  components: { DetailCommonField },
  inheritAttrs: false
});
</script>

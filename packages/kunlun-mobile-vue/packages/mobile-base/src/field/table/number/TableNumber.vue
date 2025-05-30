<template>
  <div>
    {{ currentValue }}
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    currentValue: {
      type: String || Number || undefined
    }
  },
  inheritAttrs: false
});
</script>

<template>
  <div class="mobile-detail-upload-img">
    <span class="item" v-for="item in currentValue" :key="item.id">{{ item.name }}</span>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    currentValue: {
      type: Array as PropType<Array<any>>,
      default: () => [],
      required: true
    }
  }
});
</script>

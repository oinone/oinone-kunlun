<template>
  <div class="permission-exp-display-name">{{ value }}</div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({ value: String });
</script>
<style lang="scss">
.permission-exp-display-name {
  background: #eee;
  padding: var(--oio-padding-md);
  border: 1px dashed var(--oio-primary-color);
  border-radius: var(--oio-border-radius);
  min-height: 48px;
}
</style>

<template>
  <div class="k-m-layout-sidebar" :class="[mode === 'horizontal' && 'k-m-layout-sidebar-horizontal']">
    <slot></slot>
  </div>
</template>
<script>
import { defineComponent } from 'vue';
export default defineComponent({
  props: ['mode']
});
</script>

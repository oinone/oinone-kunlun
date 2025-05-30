<template>
  <div class="k-m-layout-header" id="k-m-header-wrap" :style="style">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Widget',
  props: ['style']
});
</script>

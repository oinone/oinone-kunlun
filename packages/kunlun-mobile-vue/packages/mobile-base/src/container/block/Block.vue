<template>
  <div class="k-m-layout-block" :style="style">
    <slot></slot>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Block',
  props: ['style']
});
</script>

<template>
  <div class="order-statistic">
    <div v-for="(data, i) in showData" :key="i" class="item">{{ data.displayName }} : {{ data.value }}</div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['showData'],
});
</script>

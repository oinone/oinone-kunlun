<template>
  <div class="mobile-table-map">
    <span class="mobile-table-map-item" v-for="(item, index) in value" :key="index"> {{ item.name }}:{{ item.value }}</span>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  props: ['value']
});
</script>

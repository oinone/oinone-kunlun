<template>
  <div class="wrap">
    <img :height="28" :width="28" :src="value && value.url" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  props: ['value'],
});
</script>

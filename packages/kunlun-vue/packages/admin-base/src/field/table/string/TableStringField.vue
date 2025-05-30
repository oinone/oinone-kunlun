<template>
  <span class="table-string-input" :title="currentValue">
    {{ currentValue }}
  </span>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  props: ['currentValue']
});
</script>

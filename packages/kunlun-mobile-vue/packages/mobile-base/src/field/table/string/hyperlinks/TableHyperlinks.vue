<template>
  <div class="mobile-default-table-hyperlinks" @click.stop>
    <a :href="value" :target="target" :title="value || defaultValue">{{ text || value || defaultValue }}</a>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TableHyperlinks',
  inheritAttrs: false,
  props: {
    value: {
      type: String
    },
    defaultValue: {
      type: String
    },
    text: {
      type: String
    },
    target: {
      type: String
    }
  }
});
</script>

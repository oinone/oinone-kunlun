<template>
  <div class="md-selection-base">
    <div class="md-selection-base--header" v-if="$slots.header">
      <slot name="header" />
    </div>
    <div class="md-selection-base--header" v-if="!$slots.header && title">{{ title }}</div>
    <div class="md-selection-base--content">
      <slot name="content" />
    </div>
    <div class="md-selection-base--footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: ['title', 'pagination', 'onPaginationChange'],
});
</script>

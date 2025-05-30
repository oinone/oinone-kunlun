<template>
  <div v-if="invisible"></div>
  <div v-else class="mobile-field-grid">
    <h4 :title="title" style="border-bottom: 1px solid #eee" >{{ title }}</h4>
    <div class="grid-wrapper" :style="{ 'grid-gap': gridGapStyle, 'grid-template-columns': repeatColumns }">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
      required: false
    },
    invisible: {
      type: Boolean,
      default: false
    },
    gridGap: {
      type: String,
      default: '16,16'
    },
    repeatColumns: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const gridGapStyle = computed(() => {
      return props.gridGap
        .split(',')
        .map((gap) => `${gap}px`)
        .join(' ');
    });

    return { gridGapStyle };
  }
});
</script>

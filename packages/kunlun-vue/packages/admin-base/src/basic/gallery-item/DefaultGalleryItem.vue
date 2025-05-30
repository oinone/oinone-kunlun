<template>
  <div :class="['gallery-common-item', showLabel ? '' : 'gallery-common-item-hide-label']" v-show="!invisible">
    <div class="gallery-common-item-label" v-if="showLabel" :title="label">{{ label }}</div>
    <div class="gallery-common-item-content">
      <slot />
      <slot name="itemComponent" />
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';
import { BaseGalleryItemProps } from './props';

export default defineComponent({
  name: 'DefaultGalleryItem',
  inheritAttrs: false,
  props: {
    ...BaseGalleryItemProps
  },
  setup(props) {
    const showLabel = computed(() => !!props.label);

    return {
      showLabel
    };
  }
});
</script>

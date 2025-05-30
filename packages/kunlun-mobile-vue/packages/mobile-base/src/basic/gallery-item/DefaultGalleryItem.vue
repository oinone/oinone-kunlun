<template>
  <div :class="classes" v-show="!invisible">
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
import { DEFAULT_PREFIX } from '../../ui/theme';

export default defineComponent({
  name: 'DefaultGalleryItem',
  inheritAttrs: false,
  props: {
    ...BaseGalleryItemProps
  },
  setup(props) {
    const showLabel = computed(() => !props.labelInvisible);
    const classes = computed(() => {
      return [`${DEFAULT_PREFIX}-gallery-common-item`, showLabel.value ? '' : 'gallery-common-item-hide-label'];
    });
    return {
      showLabel,
      classes
    };
  }
});
</script>

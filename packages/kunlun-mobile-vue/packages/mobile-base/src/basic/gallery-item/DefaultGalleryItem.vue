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
import { DEFAULT_PREFIX } from '../../ui/theme';
import { BaseGalleryItemProps } from './props';

export default defineComponent({
  name: 'DefaultGalleryItem',
  inheritAttrs: false,
  props: {
    ...BaseGalleryItemProps
  },
  setup(props) {
    const showLabel = computed(() => {
      if (props.labelInvisible) {
        return false;
      }
      return !!props.label;
    });

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

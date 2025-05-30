<template>
  <div class="media-paragraph" :style="colStyle || {}">
    <div v-html="realContent" class="paragraph-content" :class="[borderClassName]" />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, CSSProperties } from 'vue';

export default defineComponent({
  name: 'DefaultParagraph',
  props: {
    content: {
      type: String
    },
    borderMode: {
      type: String
    },
    colStyle: {
      type: Object as PropType<CSSProperties>
    }
  },
  setup(props) {
    const borderClassName = computed(() => {
      if (props.borderMode) {
        return `border-${props.borderMode.toLowerCase()}`;
      }
      return 'border-none';
    });
    const realContent = computed(() => {
      try {
        return decodeURI(props.content || '');
      } catch (error) {
        return props.content || '';
      }
    });
    return {
      realContent,
      borderClassName
    };
  }
});
</script>
<style lang="scss">
.media-paragraph {
  width: 100%;

  .paragraph-content {
    color: var(--oio-text-color-secondary);
    min-height: var(--oio-height);
    padding: var(--oio-padding-xxs);

    &.border-none {
      border: none;
    }

    &.border-solid {
      border: var(--oio-border-width) solid var(--oio-border-color);
    }

    &.border-dashed {
      border: var(--oio-border-width) dashed var(--oio-border-color);
    }

    font {
      color: var(--oio-error-color);
    }
  }
}
</style>

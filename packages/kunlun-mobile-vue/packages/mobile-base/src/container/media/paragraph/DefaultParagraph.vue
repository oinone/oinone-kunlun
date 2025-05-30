<template>
  <div class="media-paragraph">
    <div v-html="realContent" class="paragraph-content" :class="[borderClassName]" />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'DefaultParagraph',
  props: {
    content: {
      type: String
    },
    borderMode: {
      type: String
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
      return decodeURI(props.content || '');
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
  }
}
</style>

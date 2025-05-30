<template>
  <span v-if="!invisible" class="default-label" :style="{ fontSize: labelFontSize }">{{ label }}</span>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { TextInfoJustifyContent } from './typing';

export default defineComponent({
  name: 'DefaultTextInfoLabel',
  props: {
    label: {
      type: String
    },
    labelFontSize: {
      type: String
    },
    invisible: {
      type: Boolean
    },
    justifyContent: {
      type: String as PropType<TextInfoJustifyContent>
    }
  }
});
</script>
<style lang="scss">
.default-label {
  padding: var(--oio-padding-xs);
}
</style>

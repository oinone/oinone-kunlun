<template>
  <input
    v-model="opt.concat"
    :disabled="readonly"
    :style="{ width }"
    class="form-resource-date-format-concat"
    type="text"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  props: ['opt', 'readonly'],
  setup(props) {
    const width = computed(() => {
      if (props.opt.concat) {
        return `${props.opt.concat.length * 18}px`;
      }

      return '18px';
    });

    return { width };
  }
});
</script>

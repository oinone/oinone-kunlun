<template>
  <div class="default-picture">
    <a-image :width="width" :height="height" :src="url" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DefaultPicture',
  props: {
    url: {
      type: String
    },
    width: {
      type: String
    },
    height: {
      type: String
    }
  },
  setup(props) {}
});
</script>
<style lang="scss">
.default-picture {
  padding: var(--oio-padding-xs);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

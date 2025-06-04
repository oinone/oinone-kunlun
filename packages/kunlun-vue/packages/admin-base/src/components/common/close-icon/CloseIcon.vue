<template>
  <oio-icon class="default-close-icon" icon="oinone-guanbi1" size="10"></oio-icon>
</template>
<script lang="ts">
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    OioIcon
  }
});
</script>
<style lang="scss">
.default-close-icon {
  width: 24px;
  height: 24px;
  background: var(--oio-close-icon-background);
  color: var(--oio-icon-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

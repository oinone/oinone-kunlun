<template>
  <div class="mobile-default-icon">
    <oio-icon :icon="icon" :size="size" :color="color" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { OioIcon } from '@kunlun/vue-ui-common';

export default defineComponent({
  name: 'DefaultIcon',
  props: {
    icon: {
      type: String
    },
    color: {
      type: String
    },
    size: {
      type: String
    }
  },
  components: {
    OioIcon
  },
  setup(props) {}
});
</script>
<style lang="scss">
.mobile-default-icon {
  padding: var(--oio-padding-xs);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

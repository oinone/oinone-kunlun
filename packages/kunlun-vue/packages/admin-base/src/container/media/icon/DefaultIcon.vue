<template>
  <div v-bind="basicProps">
    <oio-icon :icon="icon" :size="size" :color="color" />
  </div>
</template>
<script lang="ts">
import { OioIcon, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'DefaultIcon',
  components: {
    OioIcon
  },
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
  setup(props, { attrs }) {
    const basicProps = computed(() => {
      return PropRecordHelper.collectionBasicProps(attrs, ['default-icon']);
    });

    return {
      basicProps
    };
  }
});
</script>
<style lang="scss">
.default-icon {
  padding: var(--oio-padding-xs);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

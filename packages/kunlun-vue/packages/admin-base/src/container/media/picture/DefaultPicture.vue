<template>
  <div v-bind="basicProps">
    <a-image :width="width" :height="height" :src="url" />
  </div>
</template>
<script lang="ts">
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { Image as AImage } from 'ant-design-vue';
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'DefaultPicture',
  components: {
    AImage
  },
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
  setup(props, { attrs }) {
    const basicProps = computed(() => {
      return PropRecordHelper.collectionBasicProps(attrs, ['default-picture']);
    });

    return {
      basicProps
    };
  }
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

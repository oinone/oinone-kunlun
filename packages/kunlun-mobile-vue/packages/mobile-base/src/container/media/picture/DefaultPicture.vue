<template>
  <div class="mobile-default-picture">
    <van-image :width="width" :height="height" :src="url" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { Image as VanImage } from 'vant';

export default defineComponent({
  name: 'DefaultPicture',
  components: { VanImage },
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
.mobile-default-picture {
  padding: var(--oio-padding-xs);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

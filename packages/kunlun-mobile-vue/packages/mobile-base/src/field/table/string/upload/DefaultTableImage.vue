<template>
  <div class="mobile-default-table-image mobile-form-media-widget-internal mobile-detail-media-widget-internal" @click.stop>
    <div class="form-media-widget-item" @click="onPreview">
      <van-image :src="currentValue" alt="" style="width: 100%; height: 100%" />
    </div>
    <preview-media v-model="showReview" type="image" :source="currentValue" />
  </div>
</template>
<script lang="ts">
import { Image as VanImage } from 'vant';
import { defineComponent, ref } from 'vue';
import PreviewMedia from '../../../../components/common/preview/PreviewMedia.vue';

export default defineComponent({
  name: 'DefaultTableImage',
  components: { VanImage, PreviewMedia },
  inheritAttrs: false,
  props: {
    currentValue: {
      type: String
    }
  },
  setup() {
    const showReview = ref(false);

    const onPreview = () => {
      showReview.value = true;
    };

    return { showReview, onPreview };
  }
});
</script>

<style lang="scss">
.mobile-default-table-image {
  .ant-image {
    height: 100%;
    width: 32px;
  }
}
</style>

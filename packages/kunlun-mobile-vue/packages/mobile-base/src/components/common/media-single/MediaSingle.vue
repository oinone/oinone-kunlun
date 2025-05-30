<template>
  <div class="mobile-form-media-widget-internal mobile-detail-media-widget-internal" @click.stop>
    <div class="form-media-widget-item" v-if="currentValue.src" @click="onPreview">
      <div class="media-video" v-if="currentValue.video">
        <video :src="currentValue.src" alt="" style="width: 100%; height: 100%"></video>
        <div class="media-video-play">
          <i class="iconfont oinone-zantingbofang"></i>
        </div>
      </div>
      <van-image :src="currentValue.src" alt="" v-else style="width: 100%; height: 100%" />
    </div>

    <preview-media v-model="showReview" :type="review.video ? 'video' : 'image'" :source="review.src" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { Image as VanImage } from 'vant';
import { VIDEO_SUFFIX_LIST } from '@kunlun/vue-ui-common';
import PreviewMedia from '../preview/PreviewMedia.vue';

export default defineComponent({
  props: ['value', 'defaultValue'],
  components: {
    PreviewMedia,
    VanImage
  },
  setup(props) {
    const review = ref({});
    const showReview = ref(false);

    const currentValue = computed(() => {
      const isVideo = VIDEO_SUFFIX_LIST.find((suffix) => (props.value || props.defaultValue || '').endsWith(suffix));

      return {
        video: !!isVideo,
        src: props.value || props.defaultValue
      };
    });

    const onPreview = () => {
      review.value = currentValue.value;
      showReview.value = true;
    };

    return { currentValue, review, showReview, onPreview };
  }
});
</script>

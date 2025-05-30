<template>
  <div class="form-media-widget-internal detail-media-widget-internal" @click.stop>
    <div class="form-media-widget-item" v-if="currentValue.src" @click="onPreview">
      <div class="media-video" v-if="currentValue.video">
        <video :src="currentValue.src" alt="" style="width: 100%; height: 100%"></video>
        <div class="media-video-play">
          <i class="iconfont oinone-zantingbofang"></i>
        </div>
      </div>
      <a-image :src="currentValue.src" alt="" v-else @click.stop style="width: 100%; height: 100%" />
    </div>
    <oio-empty v-else :empty-style="emptyStyle"></oio-empty>

    <preview-media v-model="showReview" :type="review.video ? 'video' : 'image'" :source="review.src" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import { OioEmpty, VIDEO_SUFFIX_LIST } from '@kunlun/vue-ui-common';
import PreviewMedia from '../preview/PreviewMedia.vue';
import { useMetadataProps } from '../../../basic';

export default defineComponent({
  props: {
    value: {
      type: String as PropType<string>
    },
    defaultValue: {
      type: String as PropType<string>
    },
    emptyStyle: {
      type: String as PropType<string>
    }
  },
  components: {
    PreviewMedia,
    OioEmpty
  },
  setup(props) {
    const review = ref({});
    const showReview = ref(false);

    const { realValue } = useMetadataProps(props, false);

    const currentValue = computed(() => {
      const isVideo = VIDEO_SUFFIX_LIST.find((suffix) => (realValue.value || '').endsWith(suffix));

      return {
        video: !!isVideo,
        src: realValue.value
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

<template>
  <gallery-common-field :value="value" :justify-content="justifyContent" :empty-style="emptyStyle">
    <template #default>
      <div class="gallery-media-internal-widget" @click.stop>
        <div class="gallery-media-widget-item" v-if="currentValue.src" @click="onPreview">
          <div class="gallery-media-video" v-if="currentValue.video">
            <video :src="currentValue.src" alt="" style="width: 100%; height: 100%"></video>
            <div class="gallery-media-video-play">
              <oio-icon color="#fff" size="16" icon="oinone-zantingbofang"></oio-icon>
            </div>
          </div>
          <a-image :src="currentValue.src" alt="" v-else @click.stop style="width: 100%; height: 100%" />
        </div>

        <preview-media v-model="showReview" :type="review.video ? 'video' : 'image'" :source="review.src" />
      </div>
    </template>
  </gallery-common-field>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { Image as AImage } from 'ant-design-vue';
import { VIDEO_SUFFIX_LIST, OioIcon } from '@oinone/kunlun-vue-ui-common';
import { PreviewMedia } from '../../../../components';
import GalleryCommonField from '../../common/GalleryCommonField.vue';

export default defineComponent({
  components: {
    PreviewMedia,
    GalleryCommonField,
    AImage,
    OioIcon
  },
  inheritAttrs: false,
  props: {
    value: {
      type: String
    },
    justifyContent: {
      type: String
    },
    emptyStyle: {
      type: String
    }
  },
  setup(props) {
    const review = ref({});
    const showReview = ref(false);

    const currentValue = computed(() => {
      const isVideo = VIDEO_SUFFIX_LIST.find((suffix) => (props.value || '').endsWith(suffix));

      return {
        video: !!isVideo,
        src: props.value
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

<style lang="scss">
.gallery-media-internal-widget {
  display: flex;
  flex-wrap: wrap;
  gap: var(--oio-row-gap);

  .gallery-media-widget-item {
    cursor: pointer;
    position: relative;
    width: 48px;
    height: 48px;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .gallery-media-video {
    display: flex;
    align-items: center;
  }

  .gallery-media-video-play {
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--oio-border-color);
    border-radius: var(--oio-border-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
  }

  img {
    border: 1px solid var(--oio-border-color);
    border-radius: var(--oio-border-radius-sm);
  }
}
</style>

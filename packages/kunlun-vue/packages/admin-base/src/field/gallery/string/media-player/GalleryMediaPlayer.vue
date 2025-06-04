<template>
  <gallery-common-field :value="value" :justify-content="justifyContent" :empty-style="emptyStyle">
    <template #default>
      <div class="gallery-media-widget-internal" @click.stop>
        <div class="gallery-media-widget-item" v-if="currentValue.src" @click="onPreview">
          <div class="gallery-media-video" v-if="currentValue.video">
            <video :src="currentValue.src" alt="" style="width: 100%; height: 100%"></video>
            <div class="gallery-media-video-play">
              <i class="iconfont oinone-zantingbofang"></i>
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
import { PreviewMedia } from '../../../../components';
import GalleryCommonField from '../../common/GalleryCommonField.vue';
import { VIDEO_SUFFIX_LIST } from '@oinone/kunlun-vue-ui-common';

export default defineComponent({
  components: {
    PreviewMedia,
    GalleryCommonField,
    AImage
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
.gallery-media-widget-internal {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .gallery-media-widget-item {
    cursor: pointer;
    position: relative;
    width: 32px;
    height: 32px;
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
    border: 1px solid rgba(227, 231, 238, 1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;

    i {
      font-size: 12px;
      color: #fff;
    }
  }

  img {
    border: 1px solid rgba(227, 231, 238, 1);
    border-radius: 4px;
  }
}
</style>

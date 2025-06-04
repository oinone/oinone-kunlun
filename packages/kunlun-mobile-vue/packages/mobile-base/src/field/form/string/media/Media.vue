<template>
  <div class="mobile-form-media-widget-internal">
    <div class="form-media-widget-item" v-for="(item, index) in currentValue" :key="index" @click="onPreview(item)">
      <div class="media-video" v-if="item.video">
        <video :src="item.src" alt="" style="width: 100%; height: 100%"></video>
        <div class="media-video-play">
          <i class="iconfont oinone-zantingbofang"></i>
        </div>
      </div>
      <img :src="item.src" alt="" v-else style="width: 100%; height: 100%" />
    </div>

    <preview-media v-model="showReview" :type="review.video ? 'video' : 'image'" :source="review.src" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { PreviewMedia } from '../../../../components';
import { VIDEO_SUFFIX_LIST } from '@oinone/kunlun-vue-ui-common';

export default defineComponent({
  inheritAttrs: false,
  props: ['value'],
  components: {
    PreviewMedia
  },
  setup(props) {
    const review = ref({});
    const showReview = ref(false);

    const currentValue = computed(() => {
      return (props.value || []).map((v) => {
        const isVideo = VIDEO_SUFFIX_LIST.find((suffix) => v.endsWith(suffix));

        return {
          video: !!isVideo,
          src: v
        };
      });
    });

    const onPreview = (item) => {
      review.value = item;
      showReview.value = true;
    };

    return { currentValue, review, showReview, onPreview };
  }
});
</script>
<style lang="scss">
.vxe-cell {
  .mobile-form-media-widget-internal {
    width: 100%;
    height: 100%;
    flex-wrap: nowrap;
    gap: 3px;
    align-items: center;
    .form-media-widget-item {
      width: 40px;
      height: 40px;

      i {
        font-size: 16px;
      }
    }
  }
}
.mobile-form-media-widget-internal {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .form-media-widget-item {
    cursor: pointer;
    position: relative;
    width: 100px;
    height: 100px;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .media-video {
    display: flex;
    align-items: center;
  }

  .media-video-play {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(227, 231, 238, 1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 30px;
      color: #fff;
    }
  }

  img {
    border: 1px solid rgba(227, 231, 238, 1);
    border-radius: 4px;
  }
}
</style>

<template>
  <div class="form-media-widget-internal">
    <div class="form-media-widget-item" v-for="(item, index) in currentValue" :key="index" @click="onPreview(item)">
      <div class="form-media-widget-item-use-preview" v-if="usePreview" @click.stop="">
        <div class="upload-list-item-actions">
          <eye-outlined @click="onPreview(item)" />
          <delete-outlined @click.stop="$emit('delete')" />
        </div>
      </div>
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
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue';

import { PreviewMedia } from '../../../../components';

export default defineComponent({
  props: ['value', 'usePreview'],
  components: {
    PreviewMedia,
    EyeOutlined,
    DeleteOutlined
  },
  setup(props) {
    const videoSuffix = [
      '.wmv',
      '.asf',
      '.asx',
      '.rm',
      '.rmvb',
      '.avi',
      '.dat',
      '.mkv',
      '.flv',
      '.vob',
      '.mp4',
      '.m4v',
      '.mpg',
      '.mpe',
      '.mpeg',
      '.wmv',
      '.mov',
      '.ram',
      '.swf',
      '.flv',
      '.3gp'
    ];

    const review = ref({});
    const showReview = ref(false);

    const currentValue = computed(() => {
      return (props.value || []).map((v) => {
        const isVideo = videoSuffix.find((suffix) => v.endsWith(suffix));

        return {
          video: isVideo ? true : false,
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
  .form-media-widget-internal {
    width: 100%;
    height: 100%;
    flex-wrap: nowrap;
    gap: 3px;
    align-items: center;
    .form-media-widget-item {
      width: 40px;
      height: 40px;
      border: none;
      padding: 0;

      i {
        font-size: 16px;
      }
    }
  }
}

.form-media-widget-internal {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .form-media-widget-item {
    cursor: pointer;
    position: relative;
    height: 104px;
    width: 104px;
    overflow: hidden;
    display: flex;
    align-items: center;
    border: 1px solid var(--oio-border-color);
    border-radius: 2px;
    padding: 8px;
    box-sizing: border-box;

    .form-media-widget-item-use-preview {
      position: absolute;
      left: 4px;
      bottom: 4px;
      right: 4px;
      top: 4px;
      display: flex;
      align-items: center;
      justify-content: center;

      .upload-list-item-actions {
        display: none;
        color: #fff;
        font-size: 16px;
        position: relative;
        z-index: 2;
        .anticon {
          margin: 0 4px;
        }
      }
      &::before {
        background-color: rgba(0, 0, 0, 0.5);
        content: ' ';
        height: 100%;
        opacity: 0;
        position: absolute;
        transition: all 0.3s;
        width: 100%;
        z-index: 1;
      }

      &:hover {
        &::before {
          opacity: 1;
        }

        .upload-list-item-actions {
          display: block;
        }
      }
    }
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
    border-radius: 4px;
  }
}
</style>

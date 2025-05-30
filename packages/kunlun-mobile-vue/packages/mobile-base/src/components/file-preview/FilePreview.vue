<template>
  <div class="mobile-file-preview">
    <div class="mobile-file-preview-icon"><oio-icon :icon="iconName" size="50" /></div>
    <div class="mobile-file-preview-body">
      <div class="mobile-file-preview-filename">{{ filename }}</div>
      <div class="mobile-file-preview-desc">
        <span class="" v-if="fileSize">{{ fileSize }} </span>
        <span
          v-if="iconName === 'oinone-jpg'"
          class="mobile-file-preview-btn"
          @click.stop="handlePreview"
          >{{ translateValueByKey('预览') }}</span
        >
        <span class="mobile-file-preview-download-btn" @click.stop="handleDownload">{{ translateValueByKey('下载') }}</span>
      </div>
    </div>
  </div>
  <van-popup
    v-model:show="previewVisible"
    class="mobile-file-preview-popup"
    safe-area-inset-bottom
    teleport="body"
    @close="handleCancel"
  >
    <van-image alt="" style="width: 100%; height: 100%" :src="url" />
  </van-popup>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { Popup as VanPopup, Image as VanImage } from 'vant';
import { OioIcon, VIDEO_SUFFIX_LIST } from '@kunlun/vue-ui-common';
import { translateValueByKey } from '@kunlun/engine';

export default defineComponent({
  components: {
    OioIcon,
    VanPopup,
    VanImage
  },
  props: {
    filename: String,
    url: String,
    fileSize: Number
  },
  setup(props) {
    const previewVisible = ref<boolean>(false);

    const handlePreview = () => {
      if (!props.url) {
        return;
      }

      previewVisible.value = true;
    };

    const handleDownload = () => {
      if (!props.url) {
        return;
      }

      fetch(props.url, {
        headers: {
          'Content-Type': 'application/octet-stream; charset=utf-8' // 指定 UTF-8 字符编码
        }
      })
        .then((response) => response.blob())
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.target = '_blank';
          link.download = props.filename!;

          link.click();

          URL.revokeObjectURL(blobUrl);
        })
        .catch((error) => {
          console.error('下载失败：', error);
        });
    };

    const handleCancel = () => {
      previewVisible.value = false;
    };

    const iconName = computed(() => {
      const ext = (props.filename?.split('.')?.pop() as string).toLowerCase();
      if (['jpg', 'jpeg', 'png', 'bmp', 'gif', 'heic', 'webp', 'tif'].includes(ext)) {
        return 'oinone-jpg';
      }
      if (VIDEO_SUFFIX_LIST.includes(`.${ext}`)) {
        return 'oinone-video';
      }
      if (['mp3', 'aac', 'wav', 'flac', 'm4a', 'mid', 'ape', 'ogg'].includes(ext)) {
        return 'oinone-mp';
      }
      if (['psd'].includes(ext)) {
        return 'oinone-psd';
      }
      if (['pdf'].includes(ext)) {
        return 'oinone-pdf';
      }
      if (['txt'].includes(ext)) {
        return 'oinone-txt';
      }
      if (['html', 'xml', 'java', 'jsp', 'php', 'css', 'js', 'ts'].includes(ext)) {
        return 'oinone-html';
      }
      if (['doc', 'docx', 'page'].includes(ext)) {
        return 'oinone-word';
      }
      if (['ppt', 'pptx', 'key'].includes(ext)) {
        return 'oinone-ppt';
      }
      if (['excel', 'cvs', 'xls', 'xlsx', 'number'].includes(ext)) {
        return 'oinone-excel';
      }
      if (['rar', 'zip'].includes(ext)) {
        return 'oinone-zip';
      }
      return 'oinone-white';
    });
    return {
      previewVisible,
      iconName,
      handlePreview,
      handleDownload,
      handleCancel,
      translateValueByKey
    };
  }
});
</script>

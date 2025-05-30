<template>
  <div class="default-uploadDraggable">
    <UploadCom
      :value="value"
      :limit="limit"
      :limit-size="limitSize"
      :all-limit-size="allLimitSize"
      :limitFileExtensions="limitFileExtensions"
      :disabled="disabled"
      :readonly="readonly"
      :managed="managed"
      :multiple="multiple"
      :progress="progress"
      :cdn-key="cdnKey"
      :partSize="partSize"
      :parallel="parallel"
      :chunkUploadThreshold="chunkUploadThreshold"
      :change="change"
      :remove="remove"
    >
      <div class="default-draggable-content">
        <OioIcon :icon="draggableIcon" class="default-draggable-content-icon" size="48px"></OioIcon>
        <div class="default-draggable-content-noData">
          <div class="default-draggable-content-text">{{ $translate(draggableTipText) }}</div>
          <div v-if="showDraggableExtendsionsText" class="default-draggable-content-tip">
            {{ $translate(draggableExtendsionsText) }}
          </div>
        </div>
      </div>
    </UploadCom>
  </div>
</template>

<script lang="ts">
import { OioIcon } from '@kunlun/vue-ui-antd';
import { defineComponent } from 'vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { UploadCommonProps } from '../prop';
import UploadCom from './Upload.vue';

export default defineComponent({
  name: 'UploadDraggable',
  components: { InboxOutlined, UploadCom, OioIcon },
  props: {
    ...UploadCommonProps,
    draggableIcon: {
      type: String,
      default: 'oinone-shangchuan1'
    },
    draggableTipText: {
      type: String,
      default: '点击 或 拖拽文件到这里上传'
    },
    showDraggableExtendsionsText: {
      type: Boolean,
      default: true
    },
    draggableExtendsionsText: {
      type: String
    }
  }
});
</script>

<style lang="scss">
.default-uploadDraggable {
  width: 100%;

  .oio-upload {
    > .ant-upload {
      width: 100%;
      border-radius: var(--oio-upload-border-radius);
      -webkit-box-shadow: var(--oio-upload-shadow);
      box-shadow: var(--oio-upload-shadow);
      margin: 0;
      padding: var(--oio-padding);
      background-color: rgba(var(--oio-primary-color-rgb), 0.05);
      border: var(--oio-upload-border-width-hover) var(--oio-upload-border-style-hover)
        var(--oio-upload-border-color-hover);
      color: var(--oio-upload-text-color-hover);
      outline: var(--oio-upload-outline-hover);
      cursor: pointer;
    }
  }

  .default-draggable-content {
    padding: var(--oio-padding);
    display: flex;
    flex-direction: column;
    align-items: center;

    > .default-draggable-content {
      &-noData {
        display: flex;
        flex-direction: column;
        align-items: center;

        > .default-draggable-content {
          &-icon {
            padding-top: var(--oio-padding);
          }
          &-text {
            font-weight: bold;
            padding: var(--oio-padding-md);
          }
          &-tip {
            text-align: center;
            color: var(--oio-placeholder-color);
            padding-bottom: var(--oio-padding);
          }
        }
      }

      &-uploading {
        height: 84px;
      }
    }
  }
}
</style>

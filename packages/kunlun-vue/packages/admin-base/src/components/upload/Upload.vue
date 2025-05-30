<template>
  <div class="upload-fields" @click.stop>
    <file-upload
      :value="value"
      :limit="limit"
      :limit-size="limitSize"
      :all-limit-size="allLimitSize"
      :accept="limitFileExtensions"
      :disabled="disabled"
      :readonly="readonly"
      :managed="managed"
      :multiple="multiple"
      :progress="progress"
      :cdn-key="cdnKey"
      :partSize="partSize"
      :parallel="parallel"
      :chunkUploadThreshold="chunkUploadThreshold"
      @preview="preview"
      @change="change"
      @remove="remove"
    >
      <div
        v-if="
          !readonly &&
          (!value ||
            (Array.isArray(value)
              ? limit && (limit === -1 || value.length < limit)
              : Object.keys(value).filter((name) => !name.includes('_')).length === 0))
        "
      >
        <slot>
          <oio-button :readonly="readonly" :disabled="disabled">
            <div class="form-upload-icon-area">
              <oio-icon v-if="uploadIcon" :icon="uploadIcon" />
              <upload-outlined v-else />
              {{ $translate(uploadPlaceholder || '点击上传') }}
            </div>
          </oio-button>
        </slot>
      </div>

      <template #removeIcon="{ file, continuedUpload }">
        <!-- 断点续传 -->
        <span
          v-if="file.status === 'error'"
          style="margin-right: 8px; position: relative; top: -2px"
          @click.stop.prevent="continuedUpload"
          title=""
        >
          <oio-icon icon="oinone-zhongzhi" color="var(--oio-icon-color)" />
        </span>
        <DeleteOutlined />
      </template>
    </file-upload>
  </div>
</template>

<script lang="ts">
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons-vue';
import { RedirectTargetEnum } from '@kunlun/engine';
import { downloadFile, OioButton, OioIcon } from '@kunlun/vue-ui-antd';
import { UploadFile } from 'ant-design-vue';
import { defineComponent } from 'vue';
import { useMetadataProps } from '../../basic';
import { UploadCommonProps } from '../prop';

import FileUpload from './File.vue';

export default defineComponent({
  name: 'Upload',
  components: {
    FileUpload,
    OioButton,
    OioIcon,
    DeleteOutlined,
    UploadOutlined
  },
  props: {
    ...UploadCommonProps
  },
  setup(props) {
    const { readonly, disabled } = useMetadataProps(props, true);

    const preview = (file: UploadFile) => {
      const { url } = file;
      if (!url) {
        return;
      }
      if (!props.privateLink) {
        window.open(file.url, RedirectTargetEnum.BLANK);
        return;
      }
      downloadFile(url, props.cdnKey);
    };

    return {
      readonly,
      disabled,
      preview
    };
  }
});
</script>
<style lang="scss">
.upload-fields {
  max-width: 100%;

  .ant-upload-list-item {
    &:first-child {
      margin-top: 0;
    }
  }

  .ant-upload-list-item-error {
    .ant-upload-list-item-card-actions-btn {
      opacity: 0;
    }

    &:hover {
      .ant-upload-list-item-card-actions-btn {
        opacity: 1;
      }
    }
  }
}

.form-upload-icon-area {
  display: flex;

  .oio-icon {
    margin-right: 4px;
  }

  .anticon svg {
    height: 100%;
    margin-right: 4px;
  }
}
</style>

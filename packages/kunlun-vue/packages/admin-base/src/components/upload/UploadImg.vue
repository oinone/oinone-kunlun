<template>
  <div class="oio-default-upload-img" @click.stop>
    <FileUpload
      :value="fileList"
      listType="picture-card"
      :limit="limit"
      :limit-size="limitSize"
      :all-limit-size="allLimitSize"
      :accept="limitFileExtensions || '.jpg,.jpeg,.png,.gif,.bmp'"
      :disabled="disabled"
      :readonly="readonly"
      :managed="managed"
      :multiple="multiple"
      :progress="progress"
      :cdn-key="cdnKey"
      :partSize="partSize"
      :parallel="parallel"
      :chunkUploadThreshold="chunkUploadThreshold"
      @change="onChangeFile"
      @remove="onRemoveFile"
      @preview="handlePreview"
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
          <div class="form-upload-img-icon-area">
            <oio-icon v-if="uploadIcon" :icon="uploadIcon" size="14" />
            <plus-outlined v-else />
            {{ uploadIconText }}
          </div>
          <div class="ant-upload-text">
            {{ uploadPlaceholder || (translate && translate('kunlun.button.upload')) || $translate('点击上传') }}
          </div>
        </slot>
      </div>

      <template #previewIcon="{ file, continuedUpload }">
        <!-- 断点续传 -->
        <span
          style="position: relative; top: -2px"
          v-if="file.status === 'error'"
          @click.stop.prevent="continuedUpload"
          title=""
        >
          <oio-icon icon="oinone-zhongzhi" color="#fff" />
        </span>
        <EyeOutlined v-else />
      </template>
    </FileUpload>
    <oio-modal
      width="50%"
      :visible="previewVisible"
      :title="$translate(previewTitle)"
      :footer="null"
      @update:visible="previewVisible = false"
      @cancel="handleCancel"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </oio-modal>
  </div>
</template>

<script lang="ts">
import { PlusOutlined, EyeOutlined } from '@ant-design/icons-vue';
import { Entity } from '@kunlun/meta';
import { OioIcon } from '@kunlun/vue-ui-common';
import { OioModal } from '@kunlun/vue-ui-antd';
import { isString } from 'lodash-es';
import { computed, defineComponent, PropType, ref } from 'vue';
import { useMetadataProps } from '../../basic';
import FileUpload from './File.vue';
import { UploadCommonProps } from '../prop';

export default defineComponent({
  name: 'UploadImg',
  components: {
    FileUpload,
    OioModal,
    OioIcon,
    PlusOutlined,
    EyeOutlined
  },
  inheritAttrs: false,
  props: {
    ...UploadCommonProps,
    value: {
      type: [Array, Object, String] as PropType<string | (string | object)[]>
    },
    showPreviewTitle: {
      type: Boolean,
      default: true
    }
  },
  emits: ['change', 'remove'],
  setup(props, { emit }) {
    const previewVisible = ref<boolean>(false);
    const previewTitle = ref<string | undefined>('');
    const previewImage = ref<string | undefined>('');
    const { readonly, disabled } = useMetadataProps(props, true);

    const handlePreview = async (file) => {
      if (!file.url && !file.preview) {
        return;
      }

      previewTitle.value = props.showPreviewTitle ? file.name || file.url || file.preview : '';
      previewImage.value = file.url || file.preview;
      previewVisible.value = true;
    };

    const fileList = computed(() => {
      const value = props.value;
      let currentValues: (string | object)[] | undefined;
      if (Array.isArray(value)) {
        currentValues = value;
      } else if (value != null) {
        currentValues = [value];
      }
      return (currentValues || []).map((a) => {
        if (isString(a)) {
          // image/* 是为了修复 antdv 无法识别url后缀不是图片后缀的情况，问题url: https://tse2-mm.cn.bing.net/th/id/OIP-C.U9y6BAOlqCDh4ufC_2kIgwHaFj?w=280&h=209&c=7&r=0&o=5&dpr=2&pid=1.7
          return { url: a, type: 'image/*' };
        }
        return { ...(a as unknown as Entity), type: 'image/*' };
      });
    });

    const handleCancel = () => {
      previewVisible.value = false;
    };

    const onChangeFile = (v) => {
      props.change && props.change(v);
      emit('change', v);
    };

    const onRemoveFile = (v) => {
      props.remove && props.remove(v);
      emit('remove', v);
    };

    return {
      previewVisible,
      previewTitle,
      previewImage,
      readonly,
      disabled,
      fileList,
      handlePreview,
      handleCancel,
      onChangeFile,
      onRemoveFile
    };
  }
});
</script>
<style lang="scss">
.oio-default-upload-img {
  display: flex;
  align-items: center;

  .ant-upload-select-picture-card {
    margin: 0;
  }

  .ant-upload.ant-upload-select-picture-card {
    width: unset;
    min-width: 104px;
  }

  .ant-upload-list-picture .ant-upload-list-item,
  .ant-upload-list-picture-card .ant-upload-list-item {
    border-color: var(--oio-border-color);
  }

  .ant-upload-list-picture .ant-upload-list-item-error,
  .ant-upload-list-picture-card .ant-upload-list-item-error {
    border-color: var(--oio-border-color-danger);
  }

  .ant-upload-list-item:hover .ant-upload-list-item-card-actions-btn {
    border: none;
  }
}

.form-upload-img-icon-area {
  display: flex;
  justify-content: center;
  margin: auto;

  .oio-icon {
    margin-right: 4px;
  }

  .anticon svg {
    height: 100%;
    margin-right: 4px;
  }
}
</style>

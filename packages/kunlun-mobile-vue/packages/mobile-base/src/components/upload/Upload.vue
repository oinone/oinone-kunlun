<template>
  <div class="mobile-upload-fields" :class="classes">
    <file-upload
      v-if="!readonly"
      :value="value"
      :limit="limit"
      :limit-size="limitSize"
      :all-limit-size="allLimitSize"
      :accept="limitFileExtensions"
      :disabled="disabled"
      :readonly="readonly"
      :cdn-key="cdnKey"
      :managed="managed"
      :multiple="multiple"
      :partSize="partSize"
      :parallel="parallel"
      :chunkUploadThreshold="chunkUploadThreshold"
      @change="change"
      @remove="remove"
    >
      <template #default>
        <template v-if="!showCustomUploadBtn"></template>
        <template v-else>
          <oio-button v-if="!fakeVertical" icon="oinone-shangchuan" type="primary">{{
            translateValueByKey('点击上传')
          }}</oio-button>
          <i v-else class="iconfont oinone-circle-add"></i>
        </template>
      </template>
      <template #preview-cover="{ file }">
        <div class="preview-cover van-ellipsis">{{ JSON.stringify(file) }}</div>
      </template>
    </file-upload>
    <div class="file-list" v-if="fileList.length">
      <div class="file-item" v-for="(file, index) in fileList">
        <div class="file-name" @click="onDownload(file)">
          <file-preview :filename="file.name" :url="file.url" />
        </div>
        <div class="file-delete-btn" @click="deleteHandle(file)" v-if="!readonly">
          <oio-icon icon="oinone-shanchu" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  FileHelper,
  CastHelper,
  FormLayout,
  OioButton,
  OioIcon,
  StringHelper,
  useInjectOioFormContext
} from '@kunlun/vue-ui-mobile-vant';
import { computed, defineComponent, ref, watch } from 'vue';
import { translateValueByKey } from '@kunlun/engine';
import { isNil } from 'lodash-es';
import { useMetadataProps } from '../../basic';
import { UploadCommonProps } from '../prop';

import FileUpload from './File.vue';
import FilePreview from '../file-preview/FilePreview.vue';

export default defineComponent({
  name: 'Upload',
  inheritAttrs: false,
  components: {
    FilePreview,
    FileUpload,
    OioIcon,
    OioButton
  },
  props: {
    ...UploadCommonProps,
    fakeVertical: Boolean
  },
  setup(props, context) {
    const { readonly, disabled } = useMetadataProps(props, true);
    const fileList = ref<any[]>([] as any[]);

    watch(
      () => props.value,
      (val) => {
        try {
          fileList.value = FileHelper.buildFileList(val, props.limit! as number);
        } catch (error) {
          console.error('error', error);
        }
      },
      { immediate: true, deep: true }
    );

    function deleteHandle(file) {
      const newFileList = fileList.value.filter((a, idx) => {
        if (file.uid) {
          return file.uid !== a.uid;
        }

        return file.id !== a.id;
      });

      props.change?.(newFileList);
    }

    const formContext = useInjectOioFormContext();
    const vertical = computed(() => {
      let layout;
      if (!layout && formContext) {
        layout = formContext.layout.value!;
      }
      return layout === FormLayout.VERTICAL;
    });
    const fakeVertical = computed(() => props.fakeVertical && !vertical.value);
    const showCustomUploadBtn = computed(() => {
      return (
        !readonly.value &&
        (!props.value ||
          (Array.isArray(props.value)
            ? !isNil(props.limit) && (props.limit === -1 || props.value.length < props.limit)
            : Object.keys(props.value).filter((name) => !name.includes('_')).length === 0))
      );
    });

    const onDownload = (file) => {
      if (props.readonly && file.url) {
        const $$saveAs = (window as any).saveAs;
        if ($$saveAs) {
          $$saveAs(file.url, file.name);
        }
      }
    };

    const classes = computed(() =>
      StringHelper.append([readonly && 'mobile-upload-fields-readonly'], CastHelper.cast(context.attrs.class))
    );
    return {
      classes,
      showCustomUploadBtn,
      fakeVertical,
      fileList,
      readonly,
      disabled,
      deleteHandle,
      onDownload,
      translateValueByKey
    };
  }
});
</script>

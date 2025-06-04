<script lang="ts">
import { CastHelper, ReturnPromise, ReturnVoid, StringHelper } from '@oinone/kunlun-shared';
import {
  FileModel,
  IUploadMethod,
  OioUploadProps,
  PropRecordHelper,
  useUploadFileEvent
} from '@oinone/kunlun-vue-ui-common';
import { Uploader as VanUploader } from 'vant';

import { isNil, isString, isArray } from 'lodash-es';
import { computed, createVNode, defineComponent, ref, watch, getCurrentInstance } from 'vue';
import type { UploaderFileListItem } from 'vant';
import { DEFAULT_PREFIX } from '../../theme';
import { OioNotification, OioMessage } from '../oio-notification';

export type UploaderAfterRead = (
  file: UploaderFileListItem | UploaderFileListItem[],
  detail: {
    name: string | number;
    index: number;
  }
) => void;

export default defineComponent({
  name: 'OioUpload',
  components: {
    VanUploader
  },
  inheritAttrs: false,
  props: {
    ...OioUploadProps,
    beforeUpload: Function
  },
  emits: ['success', 'failure', 'change', 'preview'],
  setup(props, context) {
    const instance = getCurrentInstance();
    const $translate = instance?.proxy?.$translate || Reflect.get(window, 'translate');
    const continuedUpload = ref(() => {});
    const uploadList = ref<FileModel[]>([]);

    watch(
      () => props.uploadList,
      (val) => {
        if (val) {
          uploadList.value = val;
        }
      },
      { immediate: true }
    );

    const realAccept = computed<string>(() => {
      const val = props.accept;
      if (isNil(val)) {
        return '';
      }
      if (isString(val)) {
        return val;
      }
      if (isArray(val)) {
        return val.join(',');
      }
      return '';
    });

    const beforeRead = (files: File | File[]) => {
      files = Array.isArray(files) ? files : [files];
      for (const file of files) {
        // image/png
        const formatFull = file.type.toUpperCase();
        // .png,.jpg
        const acceptList = realAccept.value?.toUpperCase().split(',');
        if (acceptList.length && !['', '*'].includes(acceptList[0])) {
          // eslint-disable-next-line prefer-const
          let [mainContentType, subContentType] = formatFull.split('/');
          // quickTime封装格式的文件后缀为mov
          subContentType = subContentType === 'QUICKTIME' ? 'MOV' : subContentType;
          // 兼容 .png和image/png 这2种配置
          if (!acceptList.includes(formatFull) && !acceptList.includes(`.${subContentType}`)) {
            if (!acceptList.includes(`${mainContentType}/*`)) {
              OioNotification.error(
                `${$translate('不支持上传')}${subContentType}${$translate('格式的文件')}: ${file.name}`
              );
              return false;
            }
          }
        }
        if (!checkFileSize(file)) {
          return false;
        }
      }
      return true;
    };

    function checkFileSize(file): boolean {
      const limitSize = props.limitSize;
      if (limitSize && limitSize > 0) {
        if (file.size / 1024 / 1024 > limitSize) {
          OioNotification.error($translate('异常'), `${$translate('单个文件大小不允许超过')} ${limitSize}MB`);
          return false;
        }
      }
      return true;
    }

    const customRequest: UploaderAfterRead = async (item, detail) => {
      // console.log('customRequest', item, detail)
      item = Array.isArray(item) ? item[0] : item;
      const file = item.file!;

      // 上传成功的回调
      const success = async (result, downloadUrl) => {
        const submitFileObject = result;
        if (submitFileObject && submitFileObject.url) {
          submitFileObject.uid = (file as any)?.uid;

          context.emit('success', submitFileObject);
        }
      };

      // 上传失败的回调
      const error = (...arg) => {
        context.emit('failure', ...arg, file);
      };

      // 上传中的回调
      const progress = (...arg) => {};

      const continued =
        (await useUploadFileEvent({
          file,
          accept: realAccept.value,
          managed: props.managed,
          cdnKey: props.cdnKey,
          uploadMethod: IUploadMethod.Multipart,
          partSize: props.partSize,
          parallel: props.parallel,
          chunkUploadThreshold: props.chunkUploadThreshold,
          onSuccess: success,
          onError: error,
          onProgress: progress
        })) || ({} as any);

      if (continued) {
        continuedUpload.value = continued;
      }
    };

    const remove = (file): ReturnPromise<boolean | ReturnVoid> => {
      if (props.removeCallback) {
        return props.removeCallback(file);
      }
      return true;
    };

    const onOversize = (file) => {
      OioMessage.info(`${$translate('单个文件大小不允许超过')}${props.limitSize}MB`);
    };

    return {
      uploadList,
      customRequest,
      realAccept,
      beforeRead,
      remove,
      onOversize
    };
  },
  render() {
    const uploadClassList = [`${DEFAULT_PREFIX}-upload`];
    if (this.readonly) {
      uploadClassList.push(`${DEFAULT_PREFIX}-upload-readonly`);
    }
    let showUploadList: boolean | { showPreviewIcon?: boolean; showRemoveIcon?: boolean } | undefined =
      this.showUploadList;
    if (isNil(showUploadList)) {
      showUploadList = {
        showPreviewIcon: true,
        showRemoveIcon: !this.readonly
      };
    }
    return createVNode(
      VanUploader,
      {
        ...this.$attrs,
        modelValue: this.uploadList,
        'onUpdate:modelValue': (val) => (this.uploadList = val),
        maxSize: this.limitSize < 1 ? Infinity : this.limitSize * 1024 * 1024,
        maxCount: this.limit < 1 ? Infinity : this.limit,
        accept: this.realAccept,
        multiple: this.multiple,
        listType: this.listType,
        disabled: this.disabled,
        beforeRead: this.beforeRead,
        afterRead: this.customRequest,
        onDelete: this.remove,
        onOversize: this.onOversize,
        class: StringHelper.append(uploadClassList, CastHelper.cast(this.$attrs.class))
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        {
          origin: 'default',
          isNotNull: false
        }
      ])
    );
  }
});
</script>

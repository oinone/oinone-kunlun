<script lang="ts">
import { ReturnPromise, ReturnVoid } from '@oinone/kunlun-shared';
import { FileModel, IUploadMethod, OioUploadProps, PropRecordHelper, useUploadFileEvent } from '@oinone/kunlun-vue-ui-common';
import { Upload as AUpload } from 'ant-design-vue';
import { isArray, isNil, isString } from 'lodash-es';
import { computed, createVNode, defineComponent, nextTick, ref, watch } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioMessage } from '../oio-notification';

interface FileItem {
  uid: string;
  size: number;
}

export default defineComponent({
  name: 'OioUpload',
  components: {
    AUpload
  },
  inheritAttrs: false,
  props: {
    ...OioUploadProps
  },
  emits: ['success', 'failure'],
  setup(props, context) {
    const uploadList = ref<FileModel[]>([]);
    const refreshKey = ref<number>(0);
    const isUpload = ref<boolean>(false);

    const continuedUpload = ref(() => {});

    watch(
      () => ({
        list: props.uploadList,
        isUpload: isUpload.value
      }),
      (val) => {
        if (val && val.list && !isUpload.value) {
          uploadList.value = val.list;
          refreshKey.value++;
        }
      },
      { immediate: true }
    );

    const deleteFile = (file: FileItem, fileList: FileItem[]) => {
      if (props.manual) {
        return;
      }
      const uid = file.uid;
      const index = fileList.findIndex((v) => v.uid === uid);
      if (index !== -1) {
        fileList.splice(index, 1);
      }
    };

    const beforeUpload = (file: FileItem, fileList: FileItem[]): boolean => {
      const limitSize = props.limitSize;
      if (limitSize && limitSize > 0) {
        if (file.size > limitSize * 1024 * 1024) {
          OioMessage.error(`单个文件大小不允许超过${limitSize}MB`);
          deleteFile(file, fileList);
          nextTick(() => {
            refreshKey.value++;
          });
          return false;
        }
      }
      const res = props.beforeUpload?.(file, fileList);
      if (res != null) {
        if (!res) {
          deleteFile(file, fileList);
          nextTick(() => {
            refreshKey.value++;
          });
          return false;
        }

        return res;
      }
      return true;
    };

    let timer: any = null;

    const customRequest = props.customRequest
      ? props.customRequest
      : async ({ file, onSuccess, onError, onProgress }) => {
          // 上传成功的回调
          const success = async (result, downloadUrl) => {
            const submitFileObject = result;
            if (submitFileObject && submitFileObject.url) {
              onSuccess(
                {
                  ...submitFileObject,
                  uid: file.uid
                },
                file
              );

              submitFileObject.uid = file.uid;
              context.emit('success', submitFileObject);
              timer = setTimeout(() => {
                isUpload.value = false;
              }, 100);

              return;
            }
          };

          // 上传失败的回调
          const error = (...arg) => {
            onError(...arg);
          };

          // 上传中的回调
          const progress = (...arg) => {
            isUpload.value = true;
            onProgress(...arg);
            if (timer) {
              clearTimeout(timer);
            }
          };

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

    return {
      uploadList,
      refreshKey,
      realAccept,
      beforeUpload,
      customRequest,
      remove,
      continuedUpload
    };
  },
  render() {
    const uploadClassList = [`${DEFAULT_PREFIX}-upload`];
    if (this.readonly) {
      uploadClassList.push(`${DEFAULT_PREFIX}-upload-readonly`);
    }
    if (this.disabled) {
      uploadClassList.push(`${DEFAULT_PREFIX}-upload-disabled`);
    }
    let showUploadList: boolean | { showPreviewIcon?: boolean; showRemoveIcon?: boolean } | undefined =
      this.showUploadList;
    if (isNil(showUploadList)) {
      showUploadList = {
        showPreviewIcon: true,
        showRemoveIcon: !this.readonly
      };
    }
    const slots = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      },
      'itemRender'
    ]) as Record<string, any>;

    const mapSlotIfPresent = (slotName, context) => {
      if (this.$slots[slotName]) {
        slots[slotName] = (arg) => this.$slots[slotName]?.({ ...arg, ...context });
      }
    };

    mapSlotIfPresent('previewIcon', { continuedUpload: this.continuedUpload });
    mapSlotIfPresent('removeIcon', { continuedUpload: this.continuedUpload });

    return createVNode(
      AUpload,
      {
        key: this.refreshKey,
        defaultFileList: this.uploadList,
        limit: this.limit,
        accept: this.realAccept,
        onReject: this.onReject,
        multiple: this.multiple,
        listType: this.listType,
        progress: this.progress,
        showUploadList,
        customRequest: this.customRequest,
        onRemove: this.remove,
        disabled: this.disabled,
        beforeUpload: this.beforeUpload,
        onDrop: this.onDrop,
        ...PropRecordHelper.collectionBasicProps(this.$attrs, uploadClassList)
      },
      slots
    );
  }
});
</script>

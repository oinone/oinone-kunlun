<template>
  <div class="translate-import-wrapper">
    <div class="translate-download-template">
      <div class="translate-download-template__label">{{ translateValueByKey('下载翻译模版文件') }}</div>
      <oio-button icon="oinone-xiazai2" size="small" :href="templateUrl" target="_blank">
        <span class="translate-download-template__button">{{ translateValueByKey('下载翻译模版文件') }}</span>
      </oio-button>
    </div>
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      multiple
      accept=".xlsx,.xls,.csv"
      :beforeUpload="beforeUpload"
      :customRequest="customRequest"
    >
      <p class="translate-drag-icon">
        <oio-icon :icon="uploadIcon" size="40"></oio-icon>
      </p>
      <p class="oio-group-title">{{ uploadTitle }}</p>
      <p class="translate-upload-desc">
        {{ uploadDesc }}
      </p>
    </a-upload-dragger>
    <div v-if="fileList.length">
      <div v-for="file in fileList" :key="file.name" class="translate-upload-file">
        <div class="translate-upload-file__left">
          <oio-icon icon="oinone-excel1" size="30" />
          <div>
            <div :class="['translate-upload-file__title', getFileStatus(file).fileNameColorClass || '']">
              {{ file.name }}
            </div>
            <div class="translate-upload-file__size">{{ getFileSize(file) }}</div>
          </div>
        </div>
        <div class="translate-upload-file__right">
          <div class="translate-upload-right__icon">
            <oio-icon :icon="getFileStatus(file).icon" :size="getFileStatus(file).size" />
          </div>
          <a-progress v-if="file.status === 'uploading'" :percent="file.percent" status="active" size="small" />
        </div>
      </div>
    </div>
    <div
      v-if="currentUploadStatus.resultColorClass"
      :class="['translate-upload-result', currentUploadStatus.resultColorClass]"
    >
      <div class="translate-upload-result__message">
        <oio-icon :icon="currentUploadStatus.icon" :size="18" />
        {{ translateValueByKey(currentUploadStatus.resultText || '') }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, defineProps } from 'vue';
import { UploadDragger as AUploadDragger, Progress as AProgress, UploadFile } from 'ant-design-vue';
import { OioIcon, OioButton, OioNotification } from '@kunlun/vue-ui-antd';
import { FileModel, IUploadMethod, useUploadFileEvent } from '@kunlun/vue-ui-common';
import { translateValueByKey } from '@kunlun/engine';

const props = defineProps<{
  uploadIcon: string;
  uploadTitle: string;
  uploadDesc: string;
  templateUrl: string;
  handleUpload(file: FileModel): Promise<void>;
}>();

const fileList = ref<UploadFile[]>([]);

const getFileSize = (file) => {
  if (!file?.size) {
    return '';
  }
  const sizeInKB = file.size / 1024;
  if (sizeInKB < 1024) {
    return sizeInKB % 1 === 0 ? `${sizeInKB}KB` : `${sizeInKB.toFixed(1)}KB`;
  }
  const sizeInMB = sizeInKB / 1024;
  return sizeInMB % 1 === 0 ? `${sizeInMB}MB` : `${sizeInMB.toFixed(1)}MB`;
};

const getFileStatus = (file) => {
  const { status } = file;
  if (!status) {
    return {};
  }
  if (status === 'uploading') {
    return { size: 10, icon: 'oinone-guanbi1' };
  }
  if (status === 'error') {
    return {
      size: 20,
      icon: 'oinone-cuowu1',
      fileNameColorClass: 'translate-upload-filename__error'
    };
  }
  if (status === 'done') {
    return {
      size: 20,
      icon: 'oinone-chenggong1'
    };
  }
  return {};
};

const currentUploadStatus = computed(() => {
  if (!fileList.value.length) {
    return {};
  }
  const uploading = fileList.value.some((f) => f.status === 'uploading');
  if (uploading) {
    return {};
  }
  const success = fileList.value.every((f) => f.status === 'done');
  if (success) {
    return {
      resultColorClass: 'translate-upload-result__success',
      icon: 'oinone-chenggong1',
      resultText: '文件上传成功，请至文件模块/导入任务，查看文件导入进度及结果信息'
    };
  }
  const hasSuccess = fileList.value.some((f) => f.status === 'done');
  if (hasSuccess) {
    return {
      resultColorClass: 'translate-upload-result__error',
      icon: 'oinone-cuowu1',
      resultText: '存在上传失败文件，请至文件模块/导入任务，查看文件失败信息'
    };
  }
  return {
    resultColorClass: 'translate-upload-result__error',
    icon: 'oinone-cuowu1',
    resultText: '文件上传失败，请至文件模块/导入任务，查看文件失败信息'
  };
});

const beforeUpload = (file) => {
  const accept = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];
  if (!accept.includes(file.type)) {
    file.status = 'error';
    OioNotification.error(translateValueByKey('上传失败！不支持的文件类型'));
    return false;
  }
  if (file.size > 1024 * 1024 * 50) {
    file.status = 'error';
    OioNotification.error(translateValueByKey('上传失败！文件不可超过50MB'));
    return false;
  }
  return true;
};

const customRequest = async ({ file, onSuccess, onError, onProgress }: any) => {
  file.status = 'uploading';
  const success = async (result) => {
    await props.handleUpload({ ...result, size: file.size, type: 'FILE' });
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
    }
    file.status = 'done';
  };

  const error = (...arg) => {
    file.status = 'error';
    onError(...arg);
  };

  return await useUploadFileEvent({
    file,
    managed: true,
    uploadMethod: IUploadMethod.Single,
    onSuccess: success,
    onError: error,
    onProgress
  });
};
</script>
<style lang="scss">
.translate-import-wrapper {
  .translate-download-template {
    height: 64px;
    background: #f8f9fa;
    border-radius: var(--oio-border-radius);
    display: flex;
    align-items: center;

    .translate-download-template__label {
      margin: 0 var(--oio-margin);
      color: var(--oio-text-color);
      font-size: var(--oio-font-size);
    }

    .translate-download-template__button {
      font-size: var(--oio-font-size-sm);
      color: var(--oio-text-color-secondary);
    }
  }

  .ant-upload-drag {
    background: rgba(3, 93, 255, 0.05);
    margin-top: var(--oio-margin);
    height: 170px;
  }

  .ant-upload-btn {
    padding: 30px 0 !important;
  }

  .translate-drag-icon {
    margin-bottom: var(--oio-margin);
  }

  .oio-group-title {
    font-size: var(--oio-font-size);
  }

  .translate-upload-desc {
    font-size: var(--oio-font-size-sm);
    color: var(--oio-placeholder-color);
    margin-top: 8px;
  }

  .ant-upload-list {
    display: none;
  }

  .translate-upload-file {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 78px;
    background: #f8f9fa;
    border: 1px solid var(--oio-border-color);
    margin-top: var(--oio-margin);
    padding: 0 var(--oio-padding);
  }
  .translate-upload-file__left {
    display: flex;
    > div {
      padding-left: var(--oio-padding-sm);
    }
  }
  .translate-upload-file__title {
    font-size: var(--oio-font-size);
    color: var(--oio-text-color);
    font-weight: 500;
  }
  .translate-upload-filename__error {
    color: var(--oio-error-color);
  }
  .translate-upload-file__size {
    font-size: var(--oio-font-size-sm);
    color: var(--oio-placeholder-color);
  }
  .translate-upload-file__right {
    width: 422px;
    height: 100%;
    padding: var(--oio-padding) 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .translate-upload-right__icon {
    display: flex;
    justify-content: flex-end;
  }

  .ant-progress-text {
    font-size: var(--oio-font-size-sm);
    color: var(--oio-text-color-secondary);
  }
  .translate-upload-result {
    display: flex;
    align-items: center;
    border-radius: var(--oio-border-radius);
    height: 52px;
    font-size: var(--oio-font-size);
    margin-top: var(--oio-margin);
    padding: 0 var(--oio-padding);
  }
  .translate-upload-result__success {
    background: rgba(109, 212, 0, 0.05);
    color: var(--oio-success-color);
  }
  .translate-upload-result__error {
    background: rgba(224, 32, 32, 0.05);
    color: var(--oio-error-color);
  }
}
</style>

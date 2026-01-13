<script lang="ts">
import { translateValueByKey } from '@oinone/kunlun-engine';
import { NumberHelper } from '@oinone/kunlun-shared';
import { OioEmpty, OioMessage, OioUpload } from '@oinone/kunlun-vue-ui-antd';
import { AUploadProps, FileHelper, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { isEmpty } from 'lodash-es';
import { createVNode, defineComponent, type PropType, ref, watch } from 'vue';
import { useMetadataProps } from '../../basic';

export default defineComponent({
  name: 'File',
  components: {
    OioUpload
  },
  props: {
    ...AUploadProps,
    managed: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: [Boolean, String],
      default: false
    },
    disabled: {
      type: [Boolean, String],
      default: false
    },
    limit: {
      type: [Number, String],
      default: -1
    },
    // 单个文件上传大小限制
    limitSize: {
      type: [Number, String],
      default: -1
    },
    accept: {
      type: [String, Array] as PropType<string | string[]>
    },
    value: {
      type: Object
    },
    cdnKey: {
      type: String
    },
    contentType: {
      type: String,
      default: ''
    },
    /**
     * 分片大小, 单位M
     */
    partSize: {
      type: Number
    },

    /**
     * 文件大小 大于 某个值的时候开启分片上传
     */
    chunkUploadThreshold: {
      type: Number
    },

    /**
     * 分片上传并发数量
     */
    parallel: {
      type: Number
    }
  },
  emits: ['change', 'remove'],
  setup(props, context) {
    const fileList = ref<any[]>([]);

    const { readonly, disabled } = useMetadataProps(props, true);

    watch(
      () => props.value,
      (val) => {
        if (!val) {
          fileList.value = [];
          return;
        }
        let value: any[];
        if (Array.isArray(val)) {
          value = val;
        } else if (val && Object.keys(val).length > 0) {
          value = [val];
        } else {
          value = [];
        }
        fileList.value = FileHelper.normalizeFileList(value);
        const { limit } = props;
        if (limit && (limit as number) >= 1) {
          fileList.value = fileList.value.slice(-Number(limit));
        }
      },
      { immediate: true }
    );

    const onSuccess = (file) => {
      fileList.value.push(file);
      context.emit('change', fileList.value);
    };

    /**
     * 上传之前现判断 当前文件大小 + 原先上线的文件大小 是否 大于 限制的大小
     */
    const beforeUpload = (file, currentfileList) => {
      if (props.beforeUpload) {
        return props.beforeUpload(file, currentfileList);
      } else {
        if (props.accept) {
          const names = file.name.split('.') as string[];
          const type = `.${names.slice(-1)}`;
          let accepts;
          if (typeof props.accept === 'string') {
            accepts = props.accept.split(',');
          }
          if (Array.isArray(props.accept)) {
            accepts = props.accept;
          }

          accepts = accepts.map((v) => v.toLocaleLowerCase());
          if (accepts && !accepts.includes(type.toLocaleLowerCase())) {
            OioMessage.error(`${translateValueByKey('该组件配置了可上传类型为')}${props.accept}`);
            return false;
          }
        }
        const limit = props.limit as number;
        const exitFileLength = fileList.value ? fileList.value.length || 0 : 0;
        if (limit >= 0) {
          const finalLimit = limit - exitFileLength;
          const fileIndex = currentfileList.findIndex((_f) => _f.uid === file.uid);
          if (fileIndex === currentfileList.length - 1 && currentfileList.length > finalLimit) {
            OioMessage.error(`${translateValueByKey('该组件配置了最大上传数量为')}${limit}`);
          }
          if (fileIndex > finalLimit - 1) {
            return false;
          }
        }
      }

      return true;
    };

    const removeCallback = (file): boolean => {
      const { id } = file;
      const index = fileList.value.findIndex((v) => v.id === id);

      fileList.value.splice(index, 1);

      context.emit('remove', file);
      return true;
    };

    return {
      fileList,
      readonly,
      disabled,
      removeCallback,
      onSuccess,
      beforeUpload
    };
  },
  render() {
    if (this.readonly && isEmpty(this.fileList)) {
      const { empty } = this.$slots;
      if (empty) {
        return empty();
      }
      return createVNode(OioEmpty);
    }
    return createVNode(
      OioUpload,
      {
        customRequest: this.customRequest,
        uploadList: this.fileList,
        managed: this.managed,
        multiple: this.multiple,
        limit: NumberHelper.toNumber(this.limit),
        limitSize: NumberHelper.toNumber(this.limitSize),
        accept: this.accept,
        onReject: this.onReject,
        listType: this.listType,
        progress: this.progress,
        disabled: this.disabled,
        readonly: this.readonly,
        cdnKey: this.cdnKey,
        contentType: this.contentType,
        removeCallback: this.removeCallback,
        partSize: this.partSize,
        parallel: this.parallel,
        chunkUploadThreshold: this.chunkUploadThreshold,
        ...PropRecordHelper.collectionBasicProps(this.$attrs),
        onSuccess: this.onSuccess,
        beforeUpload: this.beforeUpload,
        onDrop: this.onDrop
      },
      PropRecordHelper.collectionSlots(this.$slots, ['default', 'itemRender', 'previewIcon', 'removeIcon'])
    );
  }
});
</script>

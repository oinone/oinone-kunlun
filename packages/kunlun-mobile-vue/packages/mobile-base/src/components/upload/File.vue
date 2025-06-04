<script lang="ts">
import { NumberHelper } from '@oinone/kunlun-shared';
import {
  FileHelper,
  PropRecordHelper,
  AUploadProps,
  notification,
  OioEmpty,
  OioUpload
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { isEmpty } from 'lodash-es';
import { createVNode, defineComponent, PropType, ref, watch } from 'vue';
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
    // 上传总文件大小限制
    allLimitSize: {
      type: String,
      default: '' // 1B、1KB、1MB、1GB、1TG
    },
    /**
     * 分片大小, 单位M
     */
    partSize: {
      type: Number,
      default: 5
    },

    /**
     * 文件大小 大于 某个值的时候开启分片上传
     */
    chunkUploadThreshold: {
      type: Number,
      default: 0
    }
  },
  emits: ['change', 'remove', 'preview'],
  slots: ['default', 'empty'],
  setup(props, context) {
    const fileList = ref<any[]>([]);

    const { readonly, disabled } = useMetadataProps(props, true);

    watch(
      () => props.value,
      (val) => {
        fileList.value = FileHelper.buildFileList(val, props.limit! as number);
      },
      { immediate: true }
    );

    const onSuccess = (file) => {
      fileList.value.push(file);
      context.emit('change', fileList.value);
    };

    function pow1024(number: number) {
      return Math.pow(1024, number);
    }

    function toUpCase(str: string) {
      return str.toLocaleUpperCase();
    }

    const sizeUnit = {
      // kb -> b
      KB(size: number) {
        const [s] = toUpCase(props.allLimitSize).split('KB');
        return Number(s) * pow1024(1) > size;
      },

      // MB -> b
      MB(size: number) {
        const [s] = toUpCase(props.allLimitSize).split('MB');

        return Number(s) * pow1024(2) > size;
      },

      // GB -> b
      GB(size: number) {
        const [s] = toUpCase(props.allLimitSize).split('GB');
        return Number(s) * pow1024(3) > size;
      },

      // TB -> b
      TG(size: number) {
        const [s] = toUpCase(props.allLimitSize).split('TB');
        return Number(s) * pow1024(4) > size;
      },

      B(size: number) {
        const [s] = toUpCase(props.allLimitSize).split('B');
        return Number(s) > size;
      }
    };

    const unit = Object.keys(sizeUnit).find((unit) => toUpCase(props.allLimitSize).endsWith(unit));

    let allMapSize: Record<string, number> = {};

    /**
     * 上传之前现判断 当前文件大小 + 原先上线的文件大小 是否 大于 限制的大小
     */
    const beforeUpload = (file, fileList) => {
      if (!props.allLimitSize) return true;

      const currentMapSize = {};

      // 获取当前上传文件的大小，单位为 B
      const uploadSize = fileList.reduce((s, f) => {
        currentMapSize[f.uid] = f.size;
        return s + f.size;
      }, 0);

      if (unit && sizeUnit[unit]) {
        // 获取原先上传的文件大小
        const preSize = Object.entries(allMapSize).reduce((pre, next) => {
          const [k, v] = next;
          return pre + v;
        }, 0);

        const res = sizeUnit[unit](preSize + uploadSize);
        if (!res) {
          notification.error(
            translateValueByKey('上传失败'),
            `${translateValueByKey('总文件大小已超过')}${props.allLimitSize}， ${translateValueByKey('无法上传')}`
          );
        } else {
          allMapSize = {
            ...allMapSize,
            ...currentMapSize
          };
        }
        return res;
      }

      return true;
    };

    const removeCallback = (file): boolean => {
      const { id, uid } = file;
      fileList.value.splice(
        fileList.value.indexOf((v) => v.id === id),
        1
      );

      unit && allMapSize[uid] && delete allMapSize[uid];

      context.emit('remove', file);
      return true;
    };

    const onPreview = (event) => {
      context.emit('preview', event);
    };

    return {
      fileList,
      readonly,
      disabled,
      removeCallback,
      onSuccess,
      onPreview,
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
        uploadList: this.fileList,
        managed: this.managed,
        multiple: this.multiple,
        limit: NumberHelper.toNumber(this.limit),
        limitSize: NumberHelper.toNumber(this.limitSize),
        accept: this.accept,
        partSize: this.partSize,
        chunkUploadThreshold: this.chunkUploadThreshold,
        cdnKey: this.cdnKey,
        contentType: this.contentType,
        // listType: this.listType,
        disabled: this.disabled,
        readonly: this.readonly,
        deletable: !this.readonly,
        showUpload: !this.readonly,
        removeCallback: this.removeCallback,
        onSuccess: this.onSuccess,
        onPreview: this.onPreview,
        beforeUpload: this.beforeUpload
      },
      PropRecordHelper.collectionSlots(this.$slots, ['default'])
    );
  }
});
</script>

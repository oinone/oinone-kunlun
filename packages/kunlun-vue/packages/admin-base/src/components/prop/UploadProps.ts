import { defaultMultiPartConfig } from '@oinone/kunlun-vue-ui-common';
import { PropType } from 'vue';

export const UploadCommonProps = {
  change: {
    type: Function
  },
  blur: {
    type: Function
  },
  focus: {
    type: Function
  },
  readonly: {
    type: [Boolean, String],
    default: false
  },
  disabled: {
    type: [Boolean, String],
    default: false
  },
  value: {
    type: [Array, Object]
  },
  multiple: {
    type: Boolean
  },
  limit: {
    type: [Number, String],
    default: -1
  },
  limitSize: {
    type: [Number, String],
    default: -1
  },
  allLimitSize: {
    type: String,
    default: ''
  },
  emptyStyle: {
    type: String
  },
  uploadPlaceholder: {
    type: String
  },
  uploadIcon: {
    type: String
  },
  uploadIconText: {
    type: String
  },
  limitFileExtensions: {
    type: [String, Array] as PropType<string | string[]>
  },
  remove: {
    type: Function
  },
  translate: {
    type: Function
  },
  progress: {
    type: Object as PropType<Record<string, unknown>>
  },
  cdnKey: {
    type: String
  },
  privateLink: {
    type: Boolean,
    default: undefined
  },
  contentType: {
    type: String,
    default: ''
  },
  drop: {
    type: Function
  },
  /**
   * 是否被文件系统管理，默认为true
   * 为true则会将文件存到PamirsFile模型
   */
  managed: {
    type: Boolean,
    default: true
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
};

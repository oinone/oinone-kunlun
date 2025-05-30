import { ReturnPromise, ReturnVoid } from '@kunlun/shared';
import { PropType } from 'vue';
import { FileModel } from '../../util';

export const AUploadProps = {
  multiple: {
    type: Boolean,
    default: true
  },
  // 限制上传的文件数量
  limit: {
    type: Number,
    default: -1
  },
  // 限制上传的文本大小 单位:Mb
  limitSize: {
    type: Number,
    default: -1
  },
  listType: {
    type: String
  },
  showUploadList: {
    type: Boolean,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: false
  },
  beforeUpload: {
    type: Function
  },
  progress: {
    type: Object as PropType<Record<string, unknown>>
  },
  onReject: {
    type: Function
  },
  onDrop: {
    type: Function
  },
  customRequest: {
    type: Function
  }
};

export const UploadCallbackProps = {
  removeCallback: {
    type: Function as PropType<(file) => ReturnPromise<boolean | ReturnVoid>>
  }
};

export const OioUploadProps = {
  ...AUploadProps,
  ...UploadCallbackProps,
  readonly: {
    type: Boolean,
    default: false
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
  },

  accept: {
    type: [String, Array] as PropType<string | string[]>
  },
  uploadList: {
    type: Array as PropType<FileModel[]>
  },
  managed: {
    type: Boolean,
    default: false
  },
  manual: {
    type: Boolean,
    default: false
  },
  cdnKey: {
    type: String
  },
  contentType: {
    type: String,
    default: ''
  }
};

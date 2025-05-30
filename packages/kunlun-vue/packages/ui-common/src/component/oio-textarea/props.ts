import { PropType } from 'vue';

export interface TextareaSize {
  minRows?: number;
  maxRows?: number;
}

export const ATextareaProps = {
  value: {
    type: String
  },
  defaultValue: {
    type: String
  },
  placeholder: {
    type: String
  },
  disabled: {
    type: Boolean,
    default: false
  },
  allowClear: {
    type: Boolean,
    default: false
  },
  maxlength: {
    type: Number
  },
  autoSize: {
    type: [Boolean, Object] as PropType<boolean | TextareaSize>,
    default: false
  }
};

export const OioTextareaProps = {
  ...ATextareaProps,
  showCount: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  minlength: {
    type: Number
  },
  // 兼容 antd组件截断 和 计数器功能
  truncateText: {
    type: Boolean,
    default: true
  },
  truncateMaxLength: {
    type: Number
  }
};

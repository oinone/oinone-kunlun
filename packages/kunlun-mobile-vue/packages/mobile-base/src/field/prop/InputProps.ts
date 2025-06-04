import { PropType } from 'vue';
import { IInputmodeEnum, InputType } from '@oinone/kunlun-vue-ui-common';
import { OioCommonProps, OioMetadataProps } from '../../basic/props';

export const PreSuffixProps = {
  showPrefix: {
    type: Boolean
  },
  showSuffix: {
    type: Boolean
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  prefixStore: {
    type: Boolean
  },
  suffixStore: {
    type: Boolean
  },
  prefixType: {
    type: String
  },
  suffixType: {
    type: String
  },
  prefixes: {
    type: Array as PropType<string[]>
  },
  prefixesValue: {
    type: String
  },
  type: {
    type: String
  },
  clearSetEmpty: {
    type: [Boolean, String],
    default: true
  },
  addPrefixSuffix: {
    type: Function,
    default: () => () => {}
  },
  removePrefixSuffix: {
    type: Function,
    default: () => () => {}
  },
  changeInputRealValue: {
    type: Function,
    default: () => () => {}
  },
  changePrefixesValue: {
    type: Function,
    default: () => () => {}
  }
};

export const InputStringCommonProps = {
  ...OioCommonProps,
  ...OioMetadataProps,
  ...PreSuffixProps,
  type: {
    type: [String, Object] as PropType<InputType>,
    default: InputType.TEXT
  },
  inputmode: {
    type: String as PropType<IInputmodeEnum>,
    default: IInputmodeEnum.TEXT
  },
  value: {
    type: String
  },
  defaultValue: {
    type: String
  },
  visibleIcon: {
    type: String,
    default: 'oinone-visible'
  },
  invisibleIcon: {
    type: String,
    default: 'oinone-invisible'
  },
  placeholder: {
    type: String
  },
  allowClear: {
    type: Boolean
  },
  independentlyEditable: {
    type: Boolean
  },
  showCount: {
    type: Boolean
  },
  maxLength: {
    type: [Number, String]
  },
  minLength: {
    type: [Number, String]
  }
};

export const InputMediaProps = {
  ...InputStringCommonProps,
  mode: {
    type: String
  },
  fileSource: {
    type: String
  }
};

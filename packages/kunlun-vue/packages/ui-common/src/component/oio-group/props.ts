import { CSSStyle } from '@kunlun/shared';
import { PropType } from 'vue';

export const OioGroupHelpProps = {
  help: {
    type: String,
    default: ''
  },
  helpAdjustOverflow: {
    type: Boolean,
    default: true
  },
  helpBgColor: {
    type: String
  },
  helpPlacement: {
    type: String,
    default: 'top'
  },
  helpIcon: {
    type: String,
    default: 'oinone-wenhao'
  },
  helpIconColor: {
    type: String,
    default: 'var(--oio-primary-color)'
  },
  helpIconSize: {
    type: String,
    default: 'var(--oio-font-size)'
  }
};

export const OioGroupProps = {
  title: {
    type: [String, Boolean],
    default: undefined
  },
  description: {
    type: String
  },
  border: {
    type: Boolean,
    default: true
  },
  wrapperClassName: {
    type: [String, Array] as PropType<string | string[]>
  },
  wrapperStyle: {
    type: [String, Object] as PropType<string | CSSStyle>
  },
  toolbarClassName: {
    type: [String, Array] as PropType<string | string[]>
  },
  toolbarStyle: {
    type: [String, Object] as PropType<string | CSSStyle>
  },
  ...OioGroupHelpProps
};

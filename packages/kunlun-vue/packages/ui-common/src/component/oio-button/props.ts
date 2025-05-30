import { PropType } from 'vue';

export enum ButtonType {
  default = 'default',
  primary = 'primary',
  ghost = 'ghost',
  dashed = 'dashed',
  link = 'link',
  text = 'text'
}

export enum ButtonBizStyle {
  default = 'default',
  success = 'success',
  warning = 'warning',
  danger = 'danger',
  info = 'info'
}

export enum ButtonSize {
  large = 'large',
  middle = 'middle',
  small = 'small'
}

export enum IconPlacement {
  /**
   * @deprecated please using IconPlacement#before
   */
  BEFORE = 'before',
  /**
   * @deprecated please using IconPlacement#after
   */
  AFTER = 'after',

  before = 'before',
  after = 'after'
}

const OioLinkButtonProps = {
  selected: {
    type: Boolean,
    default: undefined
  }
};

export const OioButtonProps = {
  ...OioLinkButtonProps,
  type: {
    type: String as PropType<ButtonType | keyof typeof ButtonType>,
    default: ButtonType.default
  },
  bizStyle: {
    type: String as PropType<ButtonBizStyle | keyof typeof ButtonBizStyle>,
    default: ButtonBizStyle.default
  },
  htmlType: {
    type: String
  },
  size: {
    type: String as PropType<ButtonSize | keyof typeof ButtonSize>,
    default: ButtonSize.middle
  },
  block: {
    type: Boolean,
    default: false
  },
  ghost: {
    type: Boolean,
    default: false
  },
  danger: {
    type: Boolean,
    default: false
  },
  href: {
    type: String
  },
  target: {
    type: String
  },
  async: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: undefined
  },
  disabled: {
    type: Boolean,
    default: undefined
  },
  icon: {
    type: String
  },
  iconPlacement: {
    type: String as PropType<IconPlacement | keyof Omit<typeof IconPlacement, 'BEFORE' | 'AFTER'>>,
    default: IconPlacement.BEFORE
  }
};

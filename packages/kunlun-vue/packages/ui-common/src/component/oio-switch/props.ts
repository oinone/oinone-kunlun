import { PropType, Slot } from 'vue';

export enum SwitchSize {
  default = 'default',
  small = 'small'
}

export const ASwitchProps = {
  autofocus: {
    type: Boolean,
    default: false
  },
  checked: {
    type: [Boolean, String, Number],
    default: undefined
  },
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    type: String as PropType<SwitchSize | keyof typeof SwitchSize>,
    default: SwitchSize.default
  },
  disabled: {
    type: Boolean,
    default: false
  },
  checkedValue: {
    type: [Boolean, String, Number],
    default: true
  },
  uncheckedValue: {
    type: [Boolean, String, Number],
    default: false
  }
};

export const OioSwitchProps = {
  ...ASwitchProps,
  readonly: {
    type: Boolean,
    default: false
  },
  checkedChildren: {
    type: [String, Object] as PropType<string | Slot>
  },
  uncheckedChildren: {
    type: [String, Object] as PropType<string | Slot>
  }
};

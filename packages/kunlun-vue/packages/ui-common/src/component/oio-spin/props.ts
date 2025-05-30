import { PropType, VNode } from 'vue';

export enum SpinSize {
  default = 'default',
  small = 'small',
  large = 'large'
}

export const OioSpinProps = {
  loading: {
    type: Boolean,
    default: undefined
  },
  loadingIndicator: {
    type: Object as PropType<VNode>
  },
  wrapperClassName: {
    type: [String, Array] as PropType<string | string[]>
  }
};

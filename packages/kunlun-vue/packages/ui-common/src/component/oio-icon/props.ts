import { PropType } from 'vue';

export enum IconTypeEnum {
  svg = 'svg',
  font = 'font',
  unicode = 'unicode'
}

export const OioIconProps = {
  type: {
    type: String as PropType<IconTypeEnum | keyof typeof IconTypeEnum>,
    default: IconTypeEnum.svg
  },
  /**
   * iconfont-class or image-url
   */
  icon: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: '12px'
  },
  color: {
    type: String,
    default: ''
  },
  rotate: {
    type: Number
  },
  loading: {
    type: Boolean,
    default: undefined
  },
  loadingReverse: {
    type: Boolean,
    default: undefined
  }
};

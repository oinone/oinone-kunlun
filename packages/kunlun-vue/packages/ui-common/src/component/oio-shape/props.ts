import { PropType } from 'vue';

export enum OioShapeType {
  square = 'square',
  circle = 'circle'
}

export const OioShapeProps = {
  type: {
    type: String as PropType<OioShapeType | keyof typeof OioShapeType>,
    default: OioShapeType.square
  },
  block: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '12px'
  },
  width: {
    type: String
  },
  height: {
    type: String
  },
  radius: {
    type: String
  },
  color: {
    type: String,
    default: 'rgba(0, 0, 0, 0.25)'
  },
  rotate: {
    type: Number
  }
};

import { PropType } from 'vue';

export enum DividerType {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

export enum DividerOrientation {
  center = 'center',
  left = 'left',
  right = 'right'
}

export const OioDividerProps = {
  type: {
    type: String as PropType<DividerType | keyof typeof DividerType>,
    default: DividerType.horizontal
  },
  dashed: {
    type: Boolean,
    default: false
  },
  plain: {
    type: Boolean,
    default: false
  },
  orientation: {
    type: String as PropType<DividerOrientation | keyof typeof DividerOrientation>
  }
};

import { CSSStyle } from '@kunlun/shared';
import { PropType } from 'vue';
import { CommonGutterType } from '../oio-block';
import { ListSelectMode } from '../oio-list';
import { OioSpinProps } from '../oio-spin';

export const OioGalleryProps = {
  ...OioSpinProps,
  list: {
    type: Array as PropType<Record<string, unknown>[]>,
    required: true
  },
  activeRows: {
    type: Array as PropType<Record<string, unknown>[]>
  },
  itemKey: {
    type: String,
    required: true,
    default: 'id'
  },
  cols: {
    type: Number
  },
  gutter: {
    type: [Number, String, Array, Object] as PropType<CommonGutterType>
  },
  itemClassName: {
    type: [String, Array] as PropType<string | string[]>
  },
  itemStyle: {
    type: Object as PropType<CSSStyle>
  },
  checkboxChange: {
    type: Function
  },
  selectMode: {
    type: String as PropType<keyof typeof ListSelectMode>
  }
};

export interface OioGalleryItem {
  key: string;
  data: Record<string, unknown>;
  index: number;
}

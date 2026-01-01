import type { PropType } from 'vue';
import { OioSpinProps } from '../oio-spin';

export enum EmptyStyle {
  'hyphen' = '-',
  'empty' = '[空]',
  'null' = ''
}

export const OioEmptyProps = {
  emptyStyle: {
    type: String as PropType<string | keyof typeof EmptyStyle>
  }
};

export const OioEmptyDataProps = {
  ...OioSpinProps,
  image: {
    type: String
  },
  description: {
    type: String
  }
};

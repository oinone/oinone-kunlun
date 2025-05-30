import { PropType } from 'vue';
import { CommonGutterType, FlexDirection, FlexRowAlign, FlexRowJustify, StandardGutterType } from './typing';

export const RowProps = {
  gutter: {
    type: [Number, String, Array, Object] as PropType<CommonGutterType>
  },
  align: {
    type: [String, Object] as PropType<FlexRowAlign>
  },
  justify: {
    type: [String, Object] as PropType<FlexRowJustify>
  },
  wrap: {
    type: Boolean,
    default: false
  }
};

export const OioRowProps = {
  ...RowProps
};

export const ColProps = {
  flex: {
    type: [String, Number]
  },
  offset: {
    type: Number
  },
  order: {
    type: Number
  },
  pull: {
    type: Number
  },
  push: {
    type: Number
  },
  span: {
    type: Number
  },
  xs: {
    type: [Number, Object]
  },
  sm: {
    type: [Number, Object]
  },
  md: {
    type: [Number, Object]
  },
  lg: {
    type: [Number, Object]
  },
  xl: {
    type: [Number, Object]
  },
  xxl: {
    type: [Number, Object]
  }
};

export const OioColProps = {
  ...ColProps,
  fixed: {
    type: Boolean,
    default: false
  }
};

export const OioBlockProps = {
  inline: {
    type: Boolean,
    default: false
  },
  flex: {
    type: Boolean,
    default: false
  },
  flexDirection: {
    type: String as PropType<FlexDirection>,
    default: FlexDirection.Row
  },
  gutter: {
    type: [String, Number, Array] as PropType<string | number | StandardGutterType>
  }
};

import { CSSStyle } from '@kunlun/shared';

export enum FlexRowAlign {
  TOP = 'top',
  MIDDLE = 'middle',
  BOTTOM = 'bottom'
}

export enum FlexRowJustify {
  START = 'start',
  END = 'end',
  CENTER = 'center',
  SPACE_AROUND = 'space-around',
  SPACE_BETWEEN = 'space-between'
}

export enum FlexDirection {
  Row = 'row',
  Column = 'column'
}

/**
 * 列模式
 */
export enum FlexColMode {
  /**
   * 手动模式
   * 当行的flexDirection使用row时: span属性生效
   * 当行的flexDirection使用column时: flex属性设为0 0 auto
   */
  MANUAL = 'manual',
  /**
   * 填充模式
   * flex属性设为1 1 0
   */
  FULL = 'full',
  /**
   * 自动模式
   * 不设置任何属性，由浏览器自动处理
   * 当行的wrap为false时，maxWidth属性设为unset
   */
  AUTO = 'auto'
}

export type StandardGutterType = [number, number];

export type CommonGutterType = number | string | object | [number | string | object, number | string | object];

export interface OioRowModel {
  type?: string;
  gutter?: CommonGutterType;
  align?: FlexRowAlign;
  justify?: FlexRowJustify;
  wrap?: boolean;
}

export interface OioColModel {
  mode?: FlexColMode;
  style?: CSSStyle;
  fixed?: boolean;
  flex?: string | number;
  offset?: number;
  order?: number;
  pull?: number;
  push?: number;
  span?: number | string;
  xs?: number | object;
  sm?: number | object;
  md?: number | object;
  lg?: number | object;
  xl?: number | object;
  xxl?: number | object;
}

import { CSSStyle } from './types';

export enum DslBorderVisibleType {
  top = 'top',
  right = 'right',
  bottom = 'bottom',
  left = 'left'
}

export type DslBorderVisible = boolean | string | DslBorderVisibleType[];

export interface DslDefinitionAppearanceStyle {
  width?: string;
  height?: string;
}

export interface DslDefinitionLayoutStyle {
  textAlign?: string;
  flex?: string;
  flexDirection?: string;
  flexWrap?: string | boolean;
  justifyContent?: string;
  alignItem?: string;
  alignContent?: string;
  overflow?: string;
}

export interface DslDefinitionBorderStyle {
  borderVisible?: DslBorderVisible;
  border?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  borderTop?: string;
  borderTopWidth?: string;
  borderTopStyle?: string;
  borderTopColor?: string;
  borderRight?: string;
  borderRightWidth?: string;
  borderRightStyle?: string;
  borderRightColor?: string;
  borderBottom?: string;
  borderBottomWidth?: string;
  borderBottomStyle?: string;
  borderBottomColor?: string;
  borderLeft?: string;
  borderLeftWidth?: string;
  borderLeftStyle?: string;
  borderLeftColor?: string;
}

export type DslDefinitionStyle = { style?: string | CSSStyle } & DslDefinitionAppearanceStyle &
  DslDefinitionBorderStyle &
  DslDefinitionLayoutStyle;

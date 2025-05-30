import { SlateText } from '@wangeditor/editor';

export const ExpressionElementType = 'expression';
export const ExpressionElementTagName = 'expression';
export const ExpressionElementClass = 'w-e-expression';

export type ExpressionElement = {
  type: 'expression';
  displayName: string;
  value: string;
  children: SlateText[];
};

import { SlateElement as Element } from '@wangeditor/editor';
import { IElemToHtmlConf } from '@wangeditor/core';
import { ExpressionElement, ExpressionElementTagName, ExpressionElementType } from './custome-types';

// 返回到后端的方法，把结构化的对象变成html
function expressionToHtml(elem: Element, childrenHtml: string): string {
  const { displayName = '', value = '' } = elem as ExpressionElement;
  // console.log('expressionToHtml', elem, childrenHtml)
  return `<${ExpressionElementTagName} data-display-name="${displayName}" >${value}</${ExpressionElementTagName}>`;
}

export const expressionToHtmlConf = {
  type: ExpressionElementType,
  elemToHtml: expressionToHtml
} as IElemToHtmlConf;

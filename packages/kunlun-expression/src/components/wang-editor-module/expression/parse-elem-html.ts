import { SlateDescendant as Descendant } from '@wangeditor/editor';
import { DOMElement } from '@wangeditor/editor/dist/editor/src/utils/dom';
import { IDomEditor, IParseElemHtmlConf } from '@wangeditor/core';
import { ExpressionElement, ExpressionElementTagName, ExpressionElementType } from './custome-types';

// 解析后端返回的文本内的html为前端定义的自定义元素模型
function parseExpressionHtml(elem: DOMElement, children: Descendant[], editor: IDomEditor): ExpressionElement {
  // console.log('parseExpressionHtml', elem, children)
  const value = (elem as HTMLElement)?.innerText?.replace(/\s+/gm, ' ') || elem?.getAttribute?.('data-value') || '';
  return {
    type: ExpressionElementType,
    displayName: elem?.getAttribute?.('data-display-name') || '',
    value,
    children: [{ text: value }]
  };
}

export const parseExpressionHtmlConf = {
  selector: ExpressionElementTagName,
  parseElemHtml: parseExpressionHtml
} as IParseElemHtmlConf;

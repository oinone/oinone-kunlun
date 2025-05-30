import { DOMElement } from '@wangeditor/editor/dist/editor/src/utils/dom';
import { IPreParseHtmlConf } from '@wangeditor/core';
import { ExpressionElementTagName } from './custome-types';

function preParse(expressionElem: HTMLElement): DOMElement {
  const tagName = expressionElem?.tagName || '';
  if (tagName !== ExpressionElementTagName) {
    return expressionElem;
  }

  return expressionElem as unknown as DOMElement;
}

export const preParseExpressionHtmlConf = {
  selector: ExpressionElementTagName,
  preParseHtml: preParse
} as IPreParseHtmlConf;

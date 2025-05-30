import { SlateElement as Element } from '@wangeditor/editor';
import { IDomEditor, IRenderElemConf } from '@wangeditor/core';
import {
  ExpressionElement,
  ExpressionElementClass,
  ExpressionElementTagName,
  ExpressionElementType
} from './custome-types';
import { VNode, h as snabbdomH } from 'snabbdom'

// 渲染到浏览器的方法
function renderExpression(elemNode: Element, children: VNode[] | null, editor: IDomEditor): VNode {
  const { displayName = '', value = '' } = elemNode as ExpressionElement
  // console.log('renderExpression', elemNode);
  return snabbdomH(ExpressionElementTagName, {
    id: value,
    'data-value': value,
    'data-display-name': displayName,
    className: ExpressionElementClass,
  }, displayName);
}

export const renderExpressionConf = {
  type: ExpressionElementType,
  renderElem: renderExpression,
} as IRenderElemConf;

import { IModuleConf } from '@wangeditor/core';
import { renderExpressionConf } from './render-elem';
import { expressionToHtmlConf } from './elem-to-html';
import { parseExpressionHtmlConf } from './parse-elem-html';
import { preParseExpressionHtmlConf } from './pre-parse-html';
import {
  OioWangEditExpressionModalMenuConf,
  EXPRESSION_MODAL_CLASS_NAME,
  EXPRESSION_MODAL_PANEL_CLASS_NAME
} from './menu';
import { withExpression } from './plugin';

export { ExpressionElementClass } from './custome-types';
export const wangEditorExpressionModule: Partial<IModuleConf> = {
  menus: [OioWangEditExpressionModalMenuConf],
  editorPlugin: withExpression,
  elemsToHtml: [expressionToHtmlConf],
  renderElems: [renderExpressionConf],
  parseElemsHtml: [parseExpressionHtmlConf],
  preParseHtml: [preParseExpressionHtmlConf]
};
export { OioWangEditExpressionModalMenuConf, EXPRESSION_MODAL_CLASS_NAME, EXPRESSION_MODAL_PANEL_CLASS_NAME };

import { createApp, h } from 'vue';
import { IDomEditor } from '@wangeditor/core';
import { SlateTransforms } from '@wangeditor/editor';
import {
  ExpressionDefinitionType,
  IExpressionItem,
  IExpressionOption,
  IExpressionQuoteType,
  IVariableContextItem
} from '../../../../types';
import { createDefaultExpressionItem, createExpressionDisplayName, createExpressionValue } from '../../../../share';
import ExpressionInputPanel from '../../../control/expression/ExpressionInputPanel.vue';
import { ExpressionElement, ExpressionElementType } from '../custome-types';

export function createExpressionOption(contextItems: IVariableContextItem[]): IExpressionOption {
  return {
    type: ExpressionDefinitionType.OPERATION,
    variableContextItems: contextItems!,
    quoteType: IExpressionQuoteType.SINGLE,
    useContextName: true,
    variableCustomMethod: (variableStr: string) => {
      return `\${${variableStr}}`;
    }
  } as IExpressionOption;
}

export const EXPRESSION_MODAL_CLASS_NAME = 'oio-expression-modal';
export const EXPRESSION_MODAL_PANEL_CLASS_NAME = 'oio-expression-modal-panel';

export function createExpressionDialog(contextItems: IVariableContextItem[], editor: IDomEditor) {
  const models = [] as string[];
  contextItems?.forEach((a) => {
    a?.models && models.push(...a.models);
  });
  const currentSelection = editor.selection;
  const app = createApp({
    components: { ExpressionInputPanel },
    props: {
      onExpressionSave: () => {}
    },
    render() {
      return h(ExpressionInputPanel, {
        class: EXPRESSION_MODAL_PANEL_CLASS_NAME,
        contextItems,
        models,
        expressionItemList: [createDefaultExpressionItem(ExpressionDefinitionType.OPERATION)],
        type: ExpressionDefinitionType.OPERATION,
        expressionOption: createExpressionOption(contextItems),
        onChangeList: (valueList: IExpressionItem[]) => {
          if (!valueList?.length) {
            return;
          }
          const expressionOption = createExpressionOption(contextItems);
          const displayName = createExpressionDisplayName(valueList, expressionOption);
          const value = createExpressionValue(valueList, expressionOption);
          if (value) {
            const expressionElement: ExpressionElement = {
              type: ExpressionElementType,
              displayName,
              value,
              children: [{ text: '' }] // 【注意】void node 需要一个空 text 作为 children
            };
            if (currentSelection) {
              // 插入到当前光标处
              SlateTransforms.insertNodes(editor, expressionElement, { at: currentSelection });
            } else {
              editor.insertNode(expressionElement);
            }
          } else {
            editor.insertNode({ text: '' });
          }
        },
        onHide: () => {
          editor.insertNode({ text: '' });
        }
      });
    }
  });
  editor.once('destroyed', () => {
    app.unmount();
  });
  editor.once('modalOrPanelHide', () => {
    app.unmount();
  });
  return app;
}

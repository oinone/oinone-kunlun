import { DomEditor, IDomEditor } from '@wangeditor/core';
import { IExpressionModalMenu } from './IExpressionModalMenu';

// 定义菜单 class
export class IEditExpressionModalMenu extends IExpressionModalMenu {
  protected getExpressionNode(editor: IDomEditor): Node | null {
    return DomEditor.getSelectedNodeByType(editor, 'OioEditExpressionModalMenu');
  }

  protected getModalPositionNode(editor: IDomEditor): Node | null {
    return this.getExpressionNode(editor);
  }
}

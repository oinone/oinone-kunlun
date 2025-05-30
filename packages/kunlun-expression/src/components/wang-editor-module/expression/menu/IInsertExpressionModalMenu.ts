import { IDomEditor } from '@wangeditor/core';
import { DOMElement } from '@wangeditor/editor/dist/editor/src/utils/dom';
import { IExpressionModalMenu } from './IExpressionModalMenu';

// 定义菜单 class
export class IInsertExpressionModalMenu extends IExpressionModalMenu {

  public getModalContentElem(editor: IDomEditor): DOMElement {
    setTimeout(() => {
      editor.blur();
    });
    return super.getModalContentElem(editor);
  }
}

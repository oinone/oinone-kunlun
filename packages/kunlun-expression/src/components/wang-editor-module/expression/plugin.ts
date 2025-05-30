import { IDomEditor } from '@wangeditor/core';
import { ExpressionElement, ExpressionElementType } from './custome-types';

export function withExpression<T extends IDomEditor>(editor: T): T {
  // console.log('withExpression')
  const { isInline, isVoid, insertNode } = editor
  const newEditor = editor

  // 重写 isInline
  newEditor.isInline = (elem) => {
    // console.log('withExpression.isInline', elem);
    const { type } = elem as ExpressionElement

    if (type === ExpressionElementType) {
      return true
    }

    return isInline(elem)
  }

  // 重写 isVoid
  newEditor.isVoid = elem => {
    // console.log('withExpression.isVoid', elem);

    const { type } = elem as ExpressionElement

    if (type === ExpressionElementType) {
      return true
    }

    return isVoid(elem)
  }

  // 返回 editor ，重要！
  return newEditor
}
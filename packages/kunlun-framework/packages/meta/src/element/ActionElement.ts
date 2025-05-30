import { IBaseElement } from './IBaseElement';
import { ApiElement } from './ApiElement';

/**
 * 动作按钮
 */

interface ActionElement extends IBaseElement {
  displayName: string;
  model: string;
  refs: string;
  // 生效规则
  rule: string;
  // view
  type: string;
  // 提交数据的处理api
  submitApi: string;
  api: ApiElement;
}
export { ActionElement };

import { IBaseElement } from './IBaseElement';
import { ValidationScope } from '../metadata';

/**
 * 验证器
 */
interface ValidationElement extends IBaseElement {
  // 校验类型
  scope: ValidationScope;
  // 函数校验，出入参为视图当前模型数据
  fun: string;
  // 校验表达式
  expression: string;
  // 校验结果提示信息
  tips: string;
}
export { ValidationElement };

import { IBaseElement } from './IBaseElement';
import { ModelFieldType } from '../metadata';

/**
 * 组件
 */
interface WidgetElement extends IBaseElement {
  widget: string;
  model: string;
  ttype: ModelFieldType;
  relatedTtype: ModelFieldType;
  // 复杂字段的模型编码
  references?: string;
  // list类型组件调用load函数或options-load函数加载数据时作为追加查询条件
  domain: string;
  // list类型组件调用load函数加载数据时作为追加数量限制
  limit: number;
  // 对应数据模型IModelField.name，WidgetElement.name对应IModelField.viewIndex
  data: string;
  displayName: string;
  // 显隐表达式
  invisible: string;
  // 只读表达式
  required: string;
  // 必填表达式
  readonly: string;
  // 计算
  compute: string;
  // 信息提示
  hint: string;
  sortable: boolean;
}
export { WidgetElement };

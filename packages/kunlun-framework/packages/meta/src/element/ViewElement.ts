import { IBaseElement } from './IBaseElement';
import { LoadType } from '../metadata';

/**
 * 视图
 */
interface ViewElement extends IBaseElement {
  // 组件名
  widget: string;
  // 模型编码
  model: string;
  // list类型组件调用load函数或options-load函数加载数据时作为追加查询条件
  domain: string;
  // list类型组件调用load函数加载数据时作为追加数量限制
  limit: number;
  // 绑定内容数据加载函数。
  load: string;
  // 加载的函数类型
  loadType: LoadType;
  // load函数api定义,可裁剪请求报文
  loadApi: string;
}
export { ViewElement };

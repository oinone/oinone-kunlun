import { DataType, LoadType, QueryType } from '../metadata';
import { WidgetElement } from './WidgetElement';

/**
 * 字段
 */
interface FieldElement extends WidgetElement {
  // 内容数据的类型
  dataType: DataType;

  // 绑定内容数据加载函数。
  load: string;
  loadType: LoadType;
  // 列表查询不使用queryPage接口，直传当前选中行数据
  queryType: QueryType;

  // load函数api定义,可裁剪请求报文 loadApi优先级最高，没有的情况下再找load和loadType
  loadApi: string;

  // 页面加载时，从页面加载数据load data中获取组件所需可选项数据
  options: string;
  optionsLoad: string;
  optionsLoadType: LoadType;
  optionsLoadApi: string;
  // list类型组件调用options-load函数加载数据时作为追加数量限制
  optionsLimit: number;

  // 正则校验
  pattern: string;
  // 校验表达式
  validation: string;
  // 校验结果提示
  tips: string;
  // 对齐方式
  align: string;
  width: string;
  height: string;
  // children和textContext只能二选一存在，主要是用再requestElement/responseElement/ClearElement内
  children: FieldElement[];
}
export { FieldElement };

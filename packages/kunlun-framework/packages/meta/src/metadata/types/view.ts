import { BIGINT, EntityId } from './value';

export type ViewId = EntityId;

// 视图分类，按照数据源形态区分
export enum DataClass {
  List = 'LIST', // 数据源为 ListValue
  Object = 'OBJECT' // 数据源为 ObjectValue
}

/**
 * 视图客户端类型
 */
export enum ViewClientType {
  /**
   * PC端
   */
  PC = 'PC',
  /**
   * 移动端
   */
  MOBILE = 'MOBILE'
}

/**
 * <h3>视图类型</h3>
 * <p>
 * 视图类型是描述数据类型、数据传递、数据交互的基本属性
 * </p>
 */
export enum ViewType {
  /**
   * 表格
   */
  Table = 'TABLE',
  /**
   * 表单
   */
  Form = 'FORM',
  /**
   * 详情
   */
  Detail = 'DETAIL',
  /**
   * 搜索
   */
  Search = 'SEARCH',
  /**
   * 画廊
   */
  Gallery = 'GALLERY',
  /**
   * 树
   */
  Tree = 'TREE',

  /**
   * 多视图
   */
  Multiple = 'MULTIPLE',

  /**
   * 自定义
   */
  Custom = 'CUSTOM'
}

/**
 * <h3>视图模式</h3>
 * <p>
 * 视图模式是视图类型更具备操作性的定义，相同的视图类型会有不同模式进行描述。
 * <p>例如:</p>
 * <ul>
 *   <li>【表单】视图类型可能会存在【创建】和【编辑】两种不同的模式</li>
 *   <li>【表单】视图类型可能会在某些情况下手动修改为【只读】状态</li>
 * </ul>
 * </p>
 */
export enum ViewMode {
  /**
   * 创建
   */
  Create = 'CREATE',
  /**
   * 编辑
   */
  Editor = 'EDITOR',
  /**
   * 查看
   */
  Lookup = 'LOOKUP'
}

/**
 * 跳转动作路由类型
 */
export enum ViewActionTarget {
  /**
   * 页面路由
   */
  Router = 'ROUTER',
  /**
   * 页面弹窗
   */
  Dialog = 'DIALOG',
  /**
   * 页面抽屉
   */
  Drawer = 'DRAWER',
  /**
   * 页内路由
   */
  Inner = 'INNER',
  /**
   * 打开新窗口
   */
  OpenWindow = 'OPEN_WINDOW',
  /**
   * 页面嵌入
   */
  Frame = 'iframe'
}

export enum SystemSource {
  SYSTEM = 'SYSTEM', // 内核
  BASE = 'BASE', // 系统原生
  MANUAL = 'MANUAL', // 手工新增
  UI = 'UI', // 界面新增
  RELATION = 'RELATION', // 关联关系生成
  ABSTRACT_INHERITED = 'ABSTRACT_INHERITED', // 抽象继承
  TRANSIENT_INHERITED = 'TRANSIENT_INHERITED', // 临时继承
  EXTEND_INHERITED = 'EXTEND_INHERITED', // 同表继承
  MULTI_TABLE_INHERITED = 'MULTI_TABLE_INHERITED', // 多表继承
  PROXY_INHERITED = 'PROXY_INHERITED' // 代理继承
}

export interface IView {
  id: ViewId;
  name: string;
  type: ViewType;
  model: string;
  priority: BIGINT; // 优先级
  template: string; // 自定义的模板
  active?: any; // 激活状态，暂时不使用
  title?: string;
  systemSource?: SystemSource; // 系统来源
  // 仅前端用，浏览器的title那里需要
  moduleDisplayName?: SystemSource;

  extension?: Record<string, string>;

  modelDefinition?: {
    model?: string;
    name?: string;
    moduleName?: string;
    module?: string;
  };

  baseLayoutName?: string;
  baseLayoutDefinition?: {
    name: string;
    template: string;
  };
}

/**
 * 组件的标签内的 <config /> 配置
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBaseWidgetConfig {}

/**
 * 视图组件基础配置
 */
export interface IViewWidgetConfig extends IBaseWidgetConfig {
  // 数据的提交方式：all 全量一次性提交 非all的为先提交关联数据再提交主数据
  submit?: string;
  // 排除的动作，英文逗号分隔多个值
  excludedActions?: string;
  // 校验提示
  validateTip?: boolean;
}

/**
 * select组件配置
 */
export interface IBaseSelectWidgetConfig extends IBaseWidgetConfig {
  // 搜索的时候匹配的字段，多个值用逗号分隔
  searchField?: string;
  // 展示选用的字段，多个值用逗号分隔
  labelField?: string;
  // 默认值 '-'，labelField多值间的分隔符，后端目前配置的是 name-separator，需要替换掉
  separator?: string;
}

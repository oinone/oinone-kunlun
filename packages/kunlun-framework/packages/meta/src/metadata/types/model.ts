import { BIGINT, EntityId } from './value';
import { IView, SystemSource, ViewActionTarget, ViewType } from './view';

export type ModelId = EntityId;

export interface IModel {
  id: ModelId;
  pk: string[];
  model: string;
  name: string;
  type: ModelType;
  module?: string;
  moduleName: string;
  modelFields: IModelField[];
  displayName?: string;
  labelFields?: string[];
  label?: string;
  progressField?: string;
  masterFieldStr?: string;
  progressFieldStr?: string;
  viewActionList?: IViewAction[];
  serverActionList?: IServerAction[];
  urlActionList?: IURLAction[];
  clientActionList?: IClientAction[];
  functions?: IModelFunc[];
  modelActions?: (IClientAction | IURLAction | IServerAction | IViewAction)[];
  viewList?: IView[];
  uniqueList?: { fieldList: IModelField[]; fields: string }[];
  uniques?: string[];
  indexes?: string[];
  indexList?: { fieldList: IModelField[]; fields: string[] }[];
  ordering?: string;
  attributes?: {
    requiredCondition?: string;
    invisibleCondition?: string;
    readonlyCondition?: string;
    layoutGrid: number;
    layoutGroup: string;
  };
}

export enum ModelType {
  STORE = 'STORE',
  TRANSIENT = 'TRANSIENT',
  ABSTRACT = 'ABSTRACT',
  PROXY = 'PROXY',
  CLIENT = 'CLIENT'
}

// 标准字段类型，注意不要改值，跟后端对应的
export enum ModelFieldType {
  // region string
  String = 'STRING',
  Text = 'TEXT',
  HTML = 'HTML',
  Phone = 'PHONE',
  Email = 'EMAIL',
  // endregion

  // region number
  Integer = 'INTEGER',
  Long = 'LONG',
  Float = 'FLOAT',
  Currency = 'MONEY',
  // endregion

  // region date
  DateTime = 'DATETIME',
  Date = 'DATE',
  Time = 'TIME',
  Year = 'YEAR',
  // endregion

  // region others
  Boolean = 'BOOLEAN',
  Enum = 'ENUM',
  Map = 'MAP',
  Related = 'RELATED',
  // endregion

  // region relation
  OneToOne = 'O2O',
  OneToMany = 'O2M',
  ManyToOne = 'M2O',
  ManyToMany = 'M2M',
  // endregion

  OBJ = 'OBJ',

  /**
   * @deprecated 已废弃
   */
  ID = 'ID',
  /**
   * @deprecated 已废弃
   */
  Null = 'NULL',
  /**
   * @deprecated 已废弃
   */
  UID = 'UID',
  /**
   * @deprecated 已废弃
   */
  MultiEnum = 'MULTI_ENUM' // 新增枚举多选字段
}

export const ModelFieldTypeDisplayName = {
  ID: 'ID',
  NULL: '空',
  INTEGER: '整数',
  LONG: '长整型',
  FLOAT: '浮点数',
  BOOLEAN: '布尔型',
  STRING: '文本',
  TEXT: '多行文本',
  DATETIME: '时间日期',
  DATE: '日期',
  TIME: '时间',
  YEAR: '年份',
  HTML: '富文本',
  MONEY: '金额',
  ENUM: '数据字典',
  MULTI_ENUM: '多枚举', // 新增枚举多选字段
  O2O: '一对一',
  O2M: '一对多',
  M2O: '多对一',
  M2M: '多对多',
  RELATED: '引用类型',
  MAP: '键值对',
  UID: '用户ID',
  PHONE: '手机',
  EMAIL: '邮箱'
};

export const ModelFieldTypeOptions: { label: string; value: string }[] = [
  {
    label: ModelFieldTypeDisplayName.STRING,
    value: ModelFieldType.String
  },
  {
    label: ModelFieldTypeDisplayName.TEXT,
    value: ModelFieldType.Text
  },
  {
    label: ModelFieldTypeDisplayName.HTML,
    value: ModelFieldType.HTML
  },
  {
    label: ModelFieldTypeDisplayName.PHONE,
    value: ModelFieldType.Phone
  },
  {
    label: ModelFieldTypeDisplayName.EMAIL,
    value: ModelFieldType.Email
  },
  {
    label: ModelFieldTypeDisplayName.INTEGER,
    value: ModelFieldType.Integer
  },
  {
    label: ModelFieldTypeDisplayName.LONG,
    value: ModelFieldType.Long
  },
  {
    label: ModelFieldTypeDisplayName.FLOAT,
    value: ModelFieldType.Float
  },
  {
    label: ModelFieldTypeDisplayName.MONEY,
    value: ModelFieldType.Currency
  },
  {
    label: ModelFieldTypeDisplayName.DATETIME,
    value: ModelFieldType.DateTime
  },
  {
    label: ModelFieldTypeDisplayName.DATE,
    value: ModelFieldType.Date
  },
  {
    label: ModelFieldTypeDisplayName.TIME,
    value: ModelFieldType.Time
  },
  {
    label: ModelFieldTypeDisplayName.YEAR,
    value: ModelFieldType.Year
  },
  {
    label: ModelFieldTypeDisplayName.BOOLEAN,
    value: ModelFieldType.Boolean
  },
  {
    label: ModelFieldTypeDisplayName.ENUM,
    value: ModelFieldType.Enum
  },
  {
    label: ModelFieldTypeDisplayName.MAP,
    value: ModelFieldType.Map
  },
  // {
  //   label: ModelFieldTypeDisplayName.O2O,
  //   value: ModelFieldType.OneToOne
  // },
  {
    label: ModelFieldTypeDisplayName.O2M,
    value: ModelFieldType.OneToMany
  },
  {
    label: ModelFieldTypeDisplayName.M2O,
    value: ModelFieldType.ManyToOne
  },
  {
    label: ModelFieldTypeDisplayName.M2M,
    value: ModelFieldType.ManyToMany
  }
];

export enum ModelFieldSerializeType {
  NON = 'NON',
  JSON = 'JSON',
  COMMA = 'COMMA',
  BIT = 'BIT',
  DOT = 'DOT'
}

export interface IModelField {
  id: string;
  data?: string; // 兼容v3新版字段
  name: string; // 绑定模型的属性名,对应FieldElement.data
  viewIndex: string; // 只做前端唯一识别用, 对应FieldElement.name，这里暂时不用name或者viewName是为了好全局搜索替换
  limit: number; // 分页数量? 该字段为关联关系数量限制，对于xxx2many的字段，允许选择的数量限制。
  load: string;
  loadType: LoadType;
  loadApi: string;
  ttype: ModelFieldType;
  model: string;
  modelId: ModelId;
  displayName?: string;
  max?: string;
  min?: string;
  sys?: boolean;
  systemSource?: SystemSource; // 系统来源
  size?: number; // 数值字段的长度
  decimal?: number; // 数值字段的精度
  options?: IModelFieldOption[]; // 枚举返回数据字段
  index?: boolean; // 是否索引字段
  unique?: boolean; // 是否唯一索引字段
  translate?: boolean; // 是否需要翻译

  // 临时
  label?: string;

  /**
   * 关联的对方模型，原来的 relation
   */
  references?: string;
  /**
   * m2m 关联关系的模型
   */
  through?: string;
  /**
   * 关系字段,自身模型的关联字段
   */
  relationFields?: string[];
  /**
   * 关联字段,关联模型的关联字段
   */
  referenceFields?: string[];
  /**
   * 中间模型里当前模型的关联字段
   */
  throughRelationFields?: string[];
  /**
   * 中间模型里关联模型的关联字段
   */
  throughReferenceFields?: string[];
  invisible?: boolean | string; // 默认是否可见
  priority?: BIGINT; // 字段排序
  compute?: string; // 计算
  relatedTtype?: ModelFieldType;
  widget?: string;
  field?: string;

  sortable?: boolean; // 这个字段是xml里面配置的，不是后端模型字段里面的

  hint?: string; // 这个字段是xml里面配置的，不是后端模型字段里面的
  patternType?: string; // 正则校验类型,这个字段是xml里面配置的，不是后端模型字段里面的
  pattern?: string; // 正则校验
  validation?: string; // 表达式校验
  tips?: string; // 校验失败的提示消息
  independentlyEditable?: boolean; // 是否开启行内编辑

  // relation?: string;
  // relationField?: string;
  related: string[];
  store?: boolean; // 是否需要存储
  relationStore?: boolean;
  // 存储序列化函数编码
  storeSerialize?: ModelFieldSerializeType; // NON JSON COMMA DOT
  domain?: string;
  isUnique?: boolean; // 是否全局唯一，默认值false（TODO 前端稍后再处理）
  required?: boolean | string; // 是否必填，默认值false
  requiredTips?: string; // 必填的校验文案
  domainSize?: string; // 后端给的备选项一页的数量
  readonly?: boolean; // 是否只读（新增的时候可编辑，修改的时候不可编辑），默认值false
  multi: boolean; // 字段返回值是否为数组
  format: string;
  defaultValue: string;
  attributes?: {
    requiredCondition?: string;
    invisibleCondition?: string;
    readonlyCondition?: string;
    layoutGrid: number;
    layoutGroup: string;
    layoutTab: string;
    layoutTabs: string;
  };
  // 不取名为children是因为有地方需要mixin服务端的children字段，但是相同名称的children数据类型不一样，导致不能合并代码报错，所以取了一个不冲突的字段名
  modelFields: IModelField[];
}

export enum EnumOptionState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface IModelFieldOption {
  name: string;
  value: string;
  state: EnumOptionState;
  displayName?: string;
  color?: string;
  backgroundColor?: string;
  icon?: string;
  label?: string;
  invisible?: boolean;
  isDefault?: boolean;
  hint?: string;
  thumbnail?: string;
}

export function isRelationTtype(ttype: ModelFieldType): boolean {
  return [
    ModelFieldType.OneToOne,
    ModelFieldType.OneToMany,
    ModelFieldType.ManyToOne,
    ModelFieldType.ManyToMany
  ].includes(ttype);
}

export function isToOneTtype(ttype: ModelFieldType): boolean {
  return [ModelFieldType.OneToOne, ModelFieldType.ManyToOne].includes(ttype);
}

export function isToManyTtype(ttype: ModelFieldType): boolean {
  return [ModelFieldType.ManyToMany, ModelFieldType.OneToMany].includes(ttype);
}

export function isRelatedTtype(ttype: ModelFieldType): boolean {
  return ttype === ModelFieldType.Related;
}

export interface IModule {
  id: string;
  name: string;
  module: string;
  displayName?: string;
  logo: string;
  homePage: IViewAction;
  allMenus: IMenu[];
  priority: number;
  application: boolean;
  like: boolean;
  urlHomePage?: IURLAction;
}

export interface IMenu {
  id: string;
  name: string;
  displayName: string;
  parentName: string;
  icon?: string;
  parent?: IMenu;
  priority: number;
  moduleDefinition: {
    id: string;
    name: string;
    displayName: string;
  };
  actionType?: ActionType;
  viewAction?: IViewAction;
  serverAction?: IServerAction;
  urlAction?: IURLAction;
  children?: Array<IMenu>;
  mapping?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

/**
 * 请求类型
 */
export enum ApiProtocol {
  GRAPHQL = 'graphql',
  RESTFUL = 'restful'
}

/**
 * 内容数据的类型
 */
export enum DataType {
  // 基础类型 string int 等
  PRIMITIVE = 'primitive',
  // 单体复杂对象
  OBJECT = 'object',
  // 列表
  LIST = 'list'
}

/**
 * 加载的函数类型
 */
export enum LoadType {
  // 客户端函数
  CLIENT = 'client',
  // 服务端函数
  SERVER = 'server'
}

/**
 * 校验类型
 */
export enum ValidationScope {
  // 客户端校验
  CLIENT = 'client',
  // 服务端校验
  SERVER = 'server',
  // 客户端校验 + 服务端校验
  BOTH = 'both'
}

/**
 * 查询类型
 * 不使用queryPage接口，直传当前选中行数据（对象object或者列表list，默认是domain）
 * 默认值：DOMAIN
 */
export enum QueryType {
  // 使用queryPage接口的查询条件
  DOMAIN = 'domain',
  // 取mapping标签内定义的对象数据
  OBJECT = 'object',
  // 当前选中行数据
  LIST = 'list'
}

interface IModelFuncArg {
  name: string;
  ttype: ModelFieldType;
}

export interface IModelFunc {
  method: string;
  name: string;
  fun: string;
  argumentList: IModelFuncArg[];
  type: 'CREATE' | 'DELETE' | 'UPDATE' | 'QUERY'[];
}

export enum ActionType {
  // 下面三种与服务端是对应的
  Server = 'SERVER',
  View = 'VIEW',
  URL = 'URL',
  Client = 'CLIENT',

  // 前端造出来的
  Model = 'model',
  Composition = 'COMPOSITION',

  // 项目化动态注册的自定义动作
  Custom = 'custom'
}

export enum ActionContextType {
  Single = 'SINGLE',
  Batch = 'BATCH',
  SingleAndBatch = 'SINGLE_AND_BATCH',
  ContextFree = 'CONTEXT_FREE'
}

export type ActionId = EntityId;

export interface IBaseAbstractAction {
  title?: string;
  displayName?: string;
  label?: string;
  model?: string;
  /**
   * @deprecated
   */
  rule?: string; // 过滤规则
  invisible?: string; // 按钮显隐规则
}

export interface IBaseAction extends IBaseAbstractAction {
  id: ActionId;
  name: string;
  model: string;
  modelDefinition?: IModel;
  bindingType: string[]; // action绑定在源模型上的哪些视图上
  bindingViewName?: string; // action 仅显示在指定视图上
  actionType: ActionType;
  contextType: ActionContextType;
  usageDesc?: string; // 说明
  groups?: any[]; // 群组
  builtIn?: boolean; // 是否为内置的
  skipCheck?: boolean; // FIXME: 是否跳过动作策略筛选，为了解决在现有过滤规则的前提下，一些通用的客户端动作被动作策略拦住，等动作筛选系统搞出来可以干掉
  config?: Record<string, unknown>;
  confirm?: string;
  priority?: number;
  sessionPath?: string;
}

export interface ViewActionPage {
  layoutTemplate: string; // 页面布局模板
  name: string;
  model: string;
  id: EntityId;
  active: boolean;
  viewList: IView[];
}

export interface IViewAction extends IBaseAction {
  actionType: ActionType.View;
  target: ViewActionTarget; // 目标窗口
  resModel: string;
  resModelDefinition?: IModel;
  resViewName: string;
  bindingViewName?: string; // 绑定的xmlname
  queryType?: QueryType;
  apiProtocol?: ApiProtocol;
  viewMode?: string; // 打开目标模型后，可支持切换的视图类型，用逗号 split 之后是 ViewType
  viewType: ViewType; // 打开目标模型后，默认打开的视图类型
  dataType?: DataType; // 打开目标模型的视图分类
  domain?: string; // 打开目标模型的列表类视图时附带的查询条件
  filter?: string; // 打开目标模型的列表类视图时附带的查询条件, 用户不可见
  load?: string;
  loadFunction?: IModelFunc;
  context?: Record<string, unknown>; // 上下文变量
  moduleName: string; // module 前端用短标识
  page?: ViewActionPage;
  resView?: IView;
  module: string;
  resModule?: string;
  resModuleName?: string;
  resModuleDefinition?: IModule;

  moduleDefinition?: IModule;
  maskDefinition?: {
    name: string;
    template: string;
  };
  theme?: string;
}

export interface ISharedViewAction extends IViewAction {
  sharedCode: string;
  authorizationCode: string;
  sharedParameters: string;
  browserTitle?: string;
  language?: string;
  languageIsoCode?: string;
}

export interface IServerAction extends IBaseAction {
  actionType: ActionType.Server;
  functionDefinition: IModelFunc;
  function: IModelFunc;
  module: string;
}

export enum ActionFunctionType {
  JAVA = 'JAVA',
  JS = 'JS',
  GROOVY = 'GROOVY'
}

interface IServerActionFunction {
  name: string; // 函数名称
  namespace: string; // 函数体
  funName: string; // 函数方法
  argNames: string; // 函数参数名列表
  argTypes: string; // 方法参数类型，','分割
  returnType: string; // 返回值类型
  type: ActionFunctionType; // 代码的编程语言类型
  imports?: string; // 上下文引用
  context?: string; // 上下文变量
  codes: string; // 函数代码内容
  isExported: boolean; // 是否发布服务
  exportGroup: string; // 服务发布组
  exportVersion: string; // 服务发布版本
}

export interface IURLAction extends IBaseAction {
  url: string;
  compute?: string;
  target: ViewActionTarget;
  confirm?: string;
  module: string;
  context: Record<string, unknown>;
}

// 以下部分，后端暂无定义，前端自己使用，暂时只给前端用，约束默认数据提交的
export interface IModelAction extends IBaseAction {
  actionType: ActionType.Model;
  type: ModelActionType;
  domain?: string; // 查询参数
}

export enum ModelActionType {
  FindOne = 'FindOne',
  FindList = 'FindList',
  FindAll = 'FindAll',
  InsertOne = 'InsertOne',
  UpdateOne = 'UpdateOne',
  DeleteOne = 'DeleteOne',
  DeleteOneInline = 'DeleteOneInline',
  UpdateList = 'UpdateList',
  DeleteList = 'DeleteList'
}

// 纯前端行为动作
export interface IClientAction extends IBaseAbstractAction {
  actionType: ActionType.Client;
  name: ClientActionName | string;
  bindingType?: string[]; // action绑定在源模型上的哪些视图上
  id?: string;
  contextType: ActionContextType;
  confirm?: string;
  priority?: number;
  tag?: string;
  fun?: string;
}

export enum IActionTag {
  ContextAction = 'contextFreeAction',
  SingleAction = 'singleAction',
  FooterAction = 'footer'
}

// 前端的动作类型
export enum ClientActionName {
  ValidateForm = 'validateForm',

  UpdateContext = 'updateContext',

  ShowDialog = 'showDialog',
  SubmitDialog = 'submitDialog',
  CloseDialog = 'closeDialog',

  // 这些都是纯前端行为，临时操作视图数据
  InsertEmptyItemToList = 'insertEmptyItemToList',
  InsertEmptyItemToBefore = 'insertEmptyItemToBefore',
  InsertEmptyItemToAfter = 'insertEmptyItemToAfter',
  DeleteListItem = 'deleteListItem',

  ReloadData = 'reloadData',

  CopyText = 'copyText',

  Confirm = 'confirm',

  // 根据具体实现来判断到底干什么
  StartCreate = 'startCreate',

  // 这些是表格行内操作
  StartInlineEdit = 'startInlineEdit',
  SubmitInlineEdit = 'submitInlineEdit',
  CancelInlineEdit = 'cancelInlineEdit',

  // history
  HistoryBack = 'historyBack',

  O2MCreateForm = 'O2MCreateForm',
  O2MEditForm = 'O2MEditForm',
  O2MDelete = 'O2MDelete',
  O2MCreateFormConfirm = 'O2MCreateFormConfirm',
  O2MEditFormConfirm = 'O2MEditFormConfirm',

  M2MCreateTable = 'M2MCreateTable',
  M2MDelete = 'M2MDelete',
  M2MCreateTableConfirm = 'M2MCreateTableConfirm',
  O2MCloseForm = 'O2MCloseForm'
}

// 模型默认自带的动作
export enum ModelDefaultActionName {
  create = 'create',
  update = 'update',
  delete = 'delete',
  // 跳转到详情页面的action
  redirectDetailPage = 'redirectDetailPage',
  // 跳转到创建页面的action
  redirectCreatePage = 'redirectCreatePage',
  // 跳转到编辑页面的action
  redirectUpdatePage = 'redirectUpdatePage',
  // 添加一行
  $$internal_AddOne = '$$internal_AddOne',
  // 编辑一行
  $$internal_EditOne = '$$internal_EditOne',
  // 复制一行
  $$internal_CopyOne = '$$internal_CopyOne',
  // 删除一行
  $$internal_DeleteOne = '$$internal_DeleteOne',
  // 创建数据后返回到列表页的serverAction
  $$internal_ListInsertOneAndBackToList = '$$internal_ListInsertOneAndBackToList',
  // 编辑数据后返回到列表页的serverAction
  $$internal_ListUpdateOneAndBackToList = '$$internal_ListUpdateOneAndBackToList',
  // 数据导入的action
  $$internal_GotoListImportDialog = '$$internal_GotoListImportDialog',
  // 数据导出的action
  $$internal_GotoListExportDialog = '$$internal_GotoListExportDialog',
  // 返回列表页viewAction
  $$internal_GotoListTableRouter = '$$internal_GotoListTableRouter',
  // 关闭弹窗
  $$internal_DialogCancel = '$$internal_DialogCancel',
  // 打开关联模型的创建弹窗
  $$internal_GotoO2MCreateDialog = '$$internal_GotoO2MCreateDialog',
  // 打开关联模型的编辑弹窗
  $$internal_GotoO2MEditDialog = '$$internal_GotoO2MEditDialog',

  // 未实现
  $$internal_O2MUpdateOneAndSubmitDialog = '$$internal_O2MUpdateOneAndSubmitDialog',
  // 未实现
  $$internal_O2MDeleteOne = '$$internal_O2MDeleteOne',
  // 未实现
  $$internal_DialogSubmit = '$$internal_DialogSubmit',
  // 未实现
  $$internal_O2MInsertOneAndSubmitDialog = '$$internal_O2MInsertOneAndSubmitDialog',
  // 未实现
  $$internal_ListUpdateAndCloseDialogReloadOpenerAction = '$$internal_ListUpdateAndCloseDialogReloadOpenerAction',

  // 创建数据后关闭弹窗
  $$internal_ListInsertOneAndCloseDialog = '$$internal_ListInsertOneAndCloseDialog',
  // 跳转到关联模型的列表弹窗
  $$internal_GotoM2MListDialog = '$$internal_GotoM2MListDialog',
  // 重新加载页面数据
  $$internal_ReloadData = '$$internal_ReloadData',
  // 校验表单
  $$internal_ValidateForm = '$$internal_ValidateForm',
  // 下载
  $$internal_Download = '$$internal_Download',

  /**
   * 批量更新
   */
  $$internal_BatchUpdate = '$$internal_BatchUpdate',
  /**
   * 下载导入模板
   */
  $$internal_DownloadImportWorkbook = '$$internal_DownloadImportWorkbook',
  /**
   * 导入
   */
  $$internal_ImportWorkbook = '$$internal_ImportWorkbook',
  /**
   * 导出
   */
  $$internal_ExportWorkbook = '$$internal_ExportWorkbook',
  /**
   * 打印
   */
  $$internal_PrintPdfDocument = '$$internal_PrintPdfDocument'
}

export const ModelDefaultActionNames: string[] = [
  ModelDefaultActionName.create,
  ModelDefaultActionName.update,
  ModelDefaultActionName.delete,
  ModelDefaultActionName.redirectDetailPage,
  ModelDefaultActionName.redirectCreatePage,
  ModelDefaultActionName.redirectUpdatePage
];

// 动作组合的类型
export enum ActionCompositionType {
  Sequential = 'sequential', // 串行
  Parallel = 'parallel', // 并行
  ForkJoin = 'fork-join', // 并行等待
  Race = 'race' // 竞争
}

// 组合动作，自身没有行为，只负责组合其他动作
export interface ICompositionAction extends IBaseAbstractAction {
  actionType: ActionType.Composition;
  name: ClientActionName | string;
  type?: ActionCompositionType;
  bindingType?: ViewType[];
  contextType?: ActionContextType;
  confirm?: string;
  id?: string;
  priority?: number;
  tag?: string;
}

export type ActionRuleId = EntityId;

// 前端的自定义动作，仅作为自定义代码的索引
export interface ICustomAction extends IBaseAction {
  actionType: ActionType.Custom;
  code: string; // 自定义动作的编码，项目级唯一识别，取名规则：一级模块.二级模块.动作名
}

// 自定义动作的执行方法
export type CustomActionExecutor = (action: ICustomAction, vm: any, context: any) => any | Promise<any>;

export type IAction = IViewAction | IServerAction | IURLAction | IClientAction | ICompositionAction;

export enum ActionValidationScope {
  Client = 'client',
  Server = 'server',
  Both = 'both'
}

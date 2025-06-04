import { IModelField, ModelFieldType } from '@oinone/kunlun-meta';
import { IExpSelectOption } from './Common';
import { SessionContextOption } from './ConditionRsqlOperatorConfig';

export interface IFunction {
  name: string;
  displayName: string;
  fun: string;
  category: string;
  argumentList: IFunctionArgument[];
  returnType: IFunctionReturnType;
}

export interface IFunctionArgument extends IFunctionReturnType {
  name: string;
}

export interface IFunctionReturnType {
  multi?: string;
  model?: string;
  ttype?: ModelFieldType;
  dictionary?: string;
  // 前端加的字段，存储变量用
  param?: string;
  variableItemList?: IVariableItem[];
  // 仅前端使用
  showValueListLabel?: boolean;
  valueListDisplayName?: string;
  valueListApiName?: string;
  paramDisplayName?: string;
}

export enum ModelOptionType {
  MODEL = 'model',
  FIELD = 'field'
}

// 表达式模式
export enum ExpressionMode {
  // 快捷模式
  QUICK = 'QUICK',
  // 高级模式
  SENIOR = 'SENIOR',
  // 源码模式
  SOURCE = 'SOURCE'
}

export enum ExpressionSeniorMode {
  // api名称，英文字母
  API_NAME = 'API_NAME',
  // 展示名称
  DISPLAY_NAME = 'DISPLAY_NAME',
  // 实际存储用的
  VALUE = 'VALUE'
}

export enum ExpressionDefinitionType {
  // 布尔表达式
  BOOLEAN_CONDITION = 'BOOLEAN_CONDITION',
  // rsql表达式
  RSQL_CONDITION = 'RSQL_CONDITION',
  // CONDITION = 'CONDITION',
  // 运算表达式
  OPERATION = 'OPERATION'
}

export enum ExpressionItemType {
  // 混合模式，包含常量和变量
  MIX = 'MIX',
  // 常量参数
  CONSTANT = 'CONSTANT',
  // 变量参数
  VARIABLE = 'VARIABLE',
  // 选项，枚举和布尔用
  OPTION = 'OPTION',
  // 字段，rsql模式选字段用
  FIELD = 'FIELD',
  SESSION = 'SESSION',
  // 括号，仅前端用
  BRACKETS = 'BRACKETS',
  // 左括号
  LEFT_BRACKET = 'LEFT_BRACKET',
  // 右括号
  RIGHT_BRACKET = 'RIGHT_BRACKET',
  // 函数, 条件表达式暂时不能用函数
  FUN = 'FUN',
  // 连接符
  CONNECTOR = 'CONNECTOR'
}

// java日期时间格式
export enum JavaDateTimeFormatEnum {
  DATETIME = 'yyyy-MM-dd HH:mm:ss',
  DATE = 'yyyy-MM-dd',
  TIME = 'HH:mm:ss',
  YEAR = 'yyyy'
}

// 后端表达式的日期转换函数，时间日期类型的数据在前端是字符串，需要通过时间函数转换
export const STR_TO_DATE_FUN = 'TO_DATE';

export interface IExpressionDisplay {
  original: string;
  translation: string;
  value: string;
  ttype: string;
  multi: boolean;
  bitEnum: boolean;
  store: boolean;
}

export interface IExpressionCell extends IExpressionDisplay {
  cellType: ExpressionItemType;
}

export interface IExpressionConnectDisplay extends IExpressionDisplay {
  connector: IExpressionCell;
}

export interface IExpressionBlock extends IExpressionConnectDisplay {
  cellList: IExpressionCell[];
  blockType: ExpressionItemType;
  fun: IExpressionCell;
  funArgList: IExpressionBlock[];
  // 嵌套一个子表达式，暂时只是前端定义，待启用
  expression: IExpressionDefinition;
}

export interface IExpressionRow extends IExpressionConnectDisplay {
  blockList: IExpressionBlock[];
  rowType: ExpressionItemType;
}

export interface IExpressionDefinition {
  model: string;
  field: string;
  key: string;
  expressionDisplay: IExpressionDisplay;
  expressionType: ExpressionDefinitionType;
  rowList: IExpressionRow[];
  // 暂时前端使用的字段
  itemList: IExpressionItem[];

  [key: string]: any;
}

export enum VariableItemType {
  // 数值：不只是字符串，也可能是数字
  STRING = 'string',
  // ENUM = 'enum',
  // DATE = 'date',
  VARIABLE = 'variable',
  // 嵌套表达式，暂未启用
  EXPRESSION = 'expression',
  OPTION = 'option',
  SESSION = 'session',
  // 数据库的字段，仅rsql模式用
  FIELD = 'field'
}

export enum VariableItemTypeDisplayName {
  STRING = '固定值',
  // ENUM = 'enum',
  // DATE = 'date',
  VARIABLE = '变量',
  // 嵌套表达式，暂未启用
  EXPRESSION = '表达式',
  OPTION = '选项',
  SESSION = '上下文',
  // 数据库的字段，仅rsql模式用
  FIELD = '字段'
}

export const VariableItemTypeList: IExpSelectOption[] = [
  {
    value: VariableItemType.VARIABLE,
    label: VariableItemTypeDisplayName.VARIABLE
  },
  {
    value: VariableItemType.FIELD,
    label: VariableItemTypeDisplayName.FIELD
  },
  {
    value: VariableItemType.STRING,
    label: VariableItemTypeDisplayName.STRING
  },
  {
    value: VariableItemType.OPTION,
    label: VariableItemTypeDisplayName.OPTION
  },
  {
    value: VariableItemType.SESSION,
    label: VariableItemTypeDisplayName.SESSION
  }
  // {
  //   value: VariableItemType.EXPRESSION,
  //   label: '表达式',
  // },
];

export interface IOperatorSelectOption extends IExpSelectOption {
  type?: VariableItemType | string;
  // 二进制枚举
  bitEnum?: boolean;
  // 多值
  multi?: boolean;
  // 右侧参数多值
  rightArgMulti?: boolean;
}

export interface IVariableItem {
  // 前端唯一识别用的编码
  varCode: string;
  type: VariableItemType;
  // 展示名称
  displayName?: string;
  // api名称，为变量时是不带上下文名称的 field
  apiName?: string;
  // 参数的字符串，为变量时是带上下文名称的 例如：activeRecord.name，在api中只有activeRecord不展示，
  value: string;
  // 嵌套的表达式用该值存储
  expression: IExpressionItem;
  subTitle: string;
  contextItemName?: string;
  ttype: ModelFieldType;
  bitEnum?: boolean;
  store?: boolean;
  selected?: boolean;
  multi: boolean;

  [key: string]: any;
}

export interface IExpressionItem {
  // 前端唯一识别用的编码
  expCode?: string;
  expressionType?: ExpressionDefinitionType;
  type: ExpressionItemType;
  // 变量
  value: string;
  valueList?: IVariableItem[];
  // 仅前端使用
  showValueListLabel?: boolean;
  // 仅前端使用
  valueListDisplayName?: string;
  // 仅前端使用
  valueListApiName?: string;
  // 条件表达式场景，比较运算符右侧的值
  compareValueList?: IVariableItem[];
  // 仅前端使用
  showCompareValueListLabel?: boolean;
  // 仅前端使用
  compareValueListDisplayName?: string;
  // 仅前端使用
  compareValueListApiName?: string;
  // 参数的显示值
  valueDisplayName?: string;
  valueApiName?: string;
  function?: IFunction;
  // 行连接运算符 运算表达式场景为算术运算符(+-*/%) 条件表达式场景为逻辑运算符(且 或)
  operator?: string;
  operatorOptions?: IExpSelectOption[];
  // 是否显示行连接运算符
  showOperator?: boolean;
  // 比较运算符
  compareOperator?: string;
  compareOperatorOptions?: IExpSelectOption[];
  // valueList 或 compareValueList 为空则为空行
  isEmptyRow?: boolean;
  // 是否选中
  checked?: boolean;
  // 是否隐藏选中框
  hideCheckbox?: boolean;
  // 括号的深度
  bracketDeep?: number;
  // 层级id，计算括号缩进用
  levelId?: number;
  parentLevelId?: number;
}

export enum FunctionCategory {
  MATH = 'MATH',
  TEXT = 'TEXT',
  REGEX = 'REGEX',
  TIME = 'TIME',
  COLLECTION = 'COLLECTION',
  MAP = 'MAP',
  OBJECT = 'OBJECT',
  CONTEXT = 'CONTEXT',
  LOGIC = 'LOGIC',
  CONSTRAINT = 'CONSTRAINT',
  DSL_LOGIC = 'DSL_LOGIC',
  SQL_DML = 'DML',
  SQL_DSL = 'DSL',
  SQL_AGG = 'SQL_AGG',
  OTHER = 'OTHER'
}

export const FunctionCategoryList: IExpSelectOption[] = [
  { value: 'MATH', label: '数学函数' },
  { value: 'TEXT', label: '文本函数' },
  { value: 'REGEX', label: '正则函数' },
  { value: 'TIME', label: '时间函数' },
  { value: 'COLLECTION', label: '集合函数' },
  { value: 'MAP', label: '键值对函数' },
  { value: 'OBJECT', label: '对象函数' },
  { value: 'CONTEXT', label: '上下文函数' },
  { value: 'LOGIC', label: '逻辑函数' },
  { value: 'CONSTRAINT', label: '模型约束函数' },
  { value: 'DSL_LOGIC', label: '逻辑DSL函数' },
  { value: 'DML', label: '数据处理函数' },
  { value: 'DSL', label: '数据查询函数' },
  { value: 'SQL_AGG', label: 'SQL聚合函数' },
  { value: 'OTHER', label: '其他函数' }
];

export const DEFAULT_EXPRESSION_OPT = '+';
export const DEFAULT_CONDITION_COMPARE_OPT = '==';
export const DEFAULT_CONDITION_OPT = 'and';
export const DEFAULT_BOOLEAN_CONDITION_OPT = '&&';

// 变量分隔符 activeRecord.item.price
export const VARIABLE_SEPARATE = '.';
// 数据标题变量控件中单个字符串最大输入长度
export const VARIABLE_MAX_STRING_LENGTH = 500;

export interface IVariableContextItem {
  // 默认是拿当前模型 当前模型:activeRecord 根模型:rootRecord
  name: string;
  displayName: string;
  // 待弃用
  models: string[];
  // 待启用
  model?: string | string[];
  // 支持指定
  modelFields?: IModelField[];
  multi?: boolean;
  ttype?: ModelFieldType;
}

export enum ExpressionKeywordDisplayName {
  activeRecord = '当前视图数据',
  rootRecord = '主视图数据',
  openerRecord = '打开者对象',
  scene = '当前页面的viewAction.name'
}

export enum IExpressionQuoteType {
  // 不加引号
  NONE = 'NONE',
  // 单引号
  SINGLE = 'SINGLE',
  // 双引号
  DOUBLE = 'DOUBLE'
}

export enum IVariableValueType {
  LEFT = 'LEFT',
  // rsql/boolean的运算操作符
  OPERATOR = 'OPERATOR',
  RIGHT = 'RIGHT'
}

export interface IVariableCustomMethodContext {
  valueList: IVariableItem[];
  operator: string;
  compareValueList: IVariableItem[];
  expressionOption: IExpressionOption;
}

export type IVariableCustomMethod = (
  variableStr: string,
  type?: IVariableValueType,
  variableCustomMethodContext?: IVariableCustomMethodContext
) => string;

export enum IExpressionLabelDisplayType {
  DISPLAY_NAME = 'DISPLAY_NAME',
  API_NAME = 'API_NAME',
  VALUE = 'VALUE'
}

export interface IExpressionOption {
  type: ExpressionDefinitionType;
  labelDisplayType?: IExpressionLabelDisplayType;
  // 是否为前端使用表达式
  isFrontend?: boolean;
  // 变量可选的类型
  ttypes?: ModelFieldType[];
  variableContextItems: IVariableContextItem[];
  models?: string[];
  // 当前模型的编码，用于rsql模式的字段选择用
  modelModel?: string;
  // 对变量额外的自定义处理方法
  variableCustomMethod?: IVariableCustomMethod;
  // 对数字类型的自定义处理方法
  numberCustomMethod?: Function;
  // 是否用括号包起来拼接的字符串变量 'xx' + activeRecord.code 会变成  ('xx' + activeRecord.code),防止计算优先级混乱
  isBetweenInBrackets?: boolean;
  // 包裹字符串的引号类型
  quoteType: IExpressionQuoteType;
  // 使用方的字段
  leftJoinField?: IModelField;
  // 使用方的字段ttype
  leftJoinTtype?: ModelFieldType;
  // 变量控件中最大可输入的字符串长度
  variableMaxStringLength?: number;
  // 是否为rsql左侧的字段
  isRsqlLeft?: boolean;
  useContextName?: boolean;
  // rsql模式可能不需要选择变量，只需要数值、选项、字段 VariableItemType
  showVariableType?: boolean;
  // 自定义Session上下文可选项
  sessionContextOptions?: SessionContextOption[];
  // 当此项为 true 时，变量点选每级菜单选项值都会发生变化
  changeVariableOnSelect?: boolean;
}

export interface IQueryExpressionParam {
  model: string;
  field: string;
  key: string;
  [key: string]: any;
}

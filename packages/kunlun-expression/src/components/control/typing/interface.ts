import { IModelField, ModelFieldType } from '@kunlun/meta';
import { PropType } from 'vue';
import {
  ExpressionDefinitionType,
  ExpressionMode,
  IExpressionItem,
  IExpressionOption,
  IExpressionQuoteType,
  IExpSelectOption,
  IFunFilterMethod,
  IVariableContextItem
} from '../../../types';

export const ExpressionCommonProps = {
  value: String,
  expressionItemList: {
    type: Array as PropType<IExpressionItem[]>,
    default: () => []
  },

  hasChangeSourceCode: Boolean,
  sourceCode: String,
  onChangeSourceCode: Function,

  expressMode: String as PropType<ExpressionMode>,
  onChangeExpressMode: Function,

  onChange: Function,
  onChangeList: Function as PropType<(expressionItems: IExpressionItem[]) => void>,
  readonly: Boolean,
  disabled: Boolean,
  placeholder: {
    type: String,
    default: '请配置'
  },
  // 表达式弹窗的标题
  title: {
    type: [String, Boolean]
  },
  expressionOption: Object as PropType<IExpressionOption>,
  type: String as PropType<ExpressionDefinitionType>,
  quoteType: String as PropType<IExpressionQuoteType>,
  leftJoinTtype: String as PropType<ModelFieldType>,
  leftJoinField: Object as PropType<IModelField>,
  contextItems: Array as PropType<IVariableContextItem[]>,
  models: Array as PropType<string[]>,
  // 指定可用的字段ttype类型
  ttypes: Array as PropType<ModelFieldType[]>,
  // field的过滤方法，提供除了ttypes指定外通过其他属性过滤field的方法，如：不取关联字段生成的字段，field.source != RELATION
  filterMethod: Function as PropType<IFunFilterMethod>,
  // 简单模式下models.length == 1，因为模型只有一个，所以选择字段的时候不需要先选模型，省掉一个交互
  isSimpleMode: Boolean,
  // FIXME 临时添加，需要跟isSimpleMode合并
  useContextName: Boolean,
  fieldOptions: {
    type: Array as PropType<IExpSelectOption[]>,
    default: () => []
  },
  blur: Function,
  changeShowDropdown: Function as PropType<(boolean) => void>,
  // 是否低代码模式
  isLowCode: {
    type: Boolean,
    default: true
  },
  canSelectedComplexField: {
    type: Boolean,
    default: false
  },
  // 展示高级模式
  showSeniorMode: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  initExpressionItemList: Function as PropType<() => Promise<IExpressionItem[]>>,
  // 当此项为 true 时，变量点选每级菜单选项值都会发生变化
  changeVariableOnSelect: {
    type: Boolean,
    default: false
  }
};

export const ExpressionEvent = ['update:value', 'change', 'change-expression-items'];

export const ConditionCommonProps = {
  ...ExpressionCommonProps,
  isFieldStore: {
    type: Boolean,
    default: undefined
  }
};

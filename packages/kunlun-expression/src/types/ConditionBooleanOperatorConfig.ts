import { ModelFieldType } from '@kunlun/meta';
import { IExpSelectOption } from './Common';
import { IOperatorSelectOption } from './ExpressionDefinition';

export enum BooleanConditionComparisonOperator {
  DATE_EQUAL = 'DATE_EQUALS',
  DATE_NOT_EQUAL = '!DATE_EQUALS',
  DATE_GREATER_THAN = 'GREATER_THAN',
  DATE_LESS_THAN = 'LESS_THAN',
  DATE_GREATER_THAN_OR_EQUAL = 'GREATER_EQUAL',
  DATE_LESS_THAN_OR_EQUAL = 'LESS_EQUAL',

  EQUAL = '==',
  NOT_EQUAL = '!=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',

  IN = 'CONTAINS',
  NOT_IN = '!CONTAINS',

  LIST_IN = 'LIST_CONTAINS',
  LIST_NOT_IN = '!LIST_CONTAINS',

  LIST_IN_LIST = 'LIST_CONTAINS_LIST',
  LIST_NOT_IN_LIST = '!LIST_CONTAINS_LIST',

  //
  LIKE = 'CONTAINS',
  STARTS = 'STARTS_WITH',
  ENDS = 'ENDS_WITH',
  NOT_LIKE = '!CONTAINS',
  NOT_STARTS = '!STARTS_WITH',
  NOT_ENDS = '!ENDS_WITH',
  // 对象判断
  IS_NULL = 'IS_NULL',
  NOT_NULL = '!IS_NULL',
  // 字符串判断
  IS_BLANK = 'IS_BLANK',
  NOT_BLANK = '!IS_BLANK',

  BOOL_IS_NULL = 'undefined == ',
  BOOL_NOT_NULL = 'undefined != ',

  LIST_EMPTY = 'LIST_IS_EMPTY',
  LIST_NOT_EMPTY = '!LIST_IS_EMPTY'
  //
  // // Binary Enumeration
  // HAS = '=has=',
  // HAS_NOT = '=hasnt=',
  // CONTAIN = '=contain=',
  // NOT_CONTAIN = '=notcontain='
}

export const ExpressionBooleanLogicOperatorList = [
  {
    label: '且',
    value: '&&'
  },
  {
    label: '或',
    value: '||'
  }
];

// 需要包裹括号的比较运算符
export const WrapperCompareBooleanOperatorList = ([] as BooleanConditionComparisonOperator[]).map((a) => a.toString());

export const NoArgFunBooleanOperatorList = ([] as BooleanConditionComparisonOperator[]).map((a) => a.toString());

export const NoRightCompareBooleanOperatorList = (
  [
    BooleanConditionComparisonOperator.IS_NULL,
    BooleanConditionComparisonOperator.NOT_NULL,
    BooleanConditionComparisonOperator.IS_BLANK,
    BooleanConditionComparisonOperator.NOT_BLANK,
    BooleanConditionComparisonOperator.LIST_EMPTY,
    BooleanConditionComparisonOperator.LIST_NOT_EMPTY
  ] as BooleanConditionComparisonOperator[]
).map((a) => a.toString());

export const OneArgFunBooleanOperatorList = [
  ...NoRightCompareBooleanOperatorList,
  BooleanConditionComparisonOperator.BOOL_IS_NULL,
  BooleanConditionComparisonOperator.BOOL_NOT_NULL
].map((a) => a.toString());

export const TwoArgLeftRightFunBooleanOperatorList = [
  BooleanConditionComparisonOperator.DATE_EQUAL,
  BooleanConditionComparisonOperator.DATE_NOT_EQUAL,
  BooleanConditionComparisonOperator.DATE_LESS_THAN,
  BooleanConditionComparisonOperator.DATE_LESS_THAN_OR_EQUAL,
  BooleanConditionComparisonOperator.DATE_GREATER_THAN,
  BooleanConditionComparisonOperator.DATE_GREATER_THAN_OR_EQUAL,
  BooleanConditionComparisonOperator.LIKE,
  BooleanConditionComparisonOperator.NOT_LIKE,
  BooleanConditionComparisonOperator.STARTS,
  BooleanConditionComparisonOperator.NOT_STARTS,
  BooleanConditionComparisonOperator.ENDS,
  BooleanConditionComparisonOperator.NOT_ENDS,
  BooleanConditionComparisonOperator.IN,
  BooleanConditionComparisonOperator.NOT_IN,
  BooleanConditionComparisonOperator.LIST_IN,
  BooleanConditionComparisonOperator.LIST_NOT_IN,
  BooleanConditionComparisonOperator.LIST_IN_LIST,
  BooleanConditionComparisonOperator.LIST_NOT_IN_LIST
].map((a) => a.toString());

// 后端解析函数需要给参数用单引号包裹起来
export const AUTO_SINGLE_QUOTE_OPERATOR_LIST = [
  ...NoRightCompareBooleanOperatorList,
  ...TwoArgLeftRightFunBooleanOperatorList
];

export const BooleanExpressionCompareOperatorList: IExpSelectOption[] = [
  {
    label: '等于',
    value: BooleanConditionComparisonOperator.EQUAL
  },
  {
    label: '不等于',
    value: BooleanConditionComparisonOperator.NOT_EQUAL
  },
  {
    label: '小于',
    value: BooleanConditionComparisonOperator.LESS_THAN
  },
  {
    label: '小于等于',
    value: BooleanConditionComparisonOperator.LESS_THAN_OR_EQUAL
  },
  {
    label: '大于',
    value: BooleanConditionComparisonOperator.GREATER_THAN
  },
  {
    label: '大于等于',
    value: BooleanConditionComparisonOperator.GREATER_THAN_OR_EQUAL
  }
];

export const NumberBooleanCompareOperatorList = [
  {
    label: '等于',
    value: BooleanConditionComparisonOperator.EQUAL
  },
  {
    label: '不等于',
    value: BooleanConditionComparisonOperator.NOT_EQUAL
  },
  {
    label: '小于',
    value: BooleanConditionComparisonOperator.LESS_THAN
  },
  {
    label: '小于等于',
    value: BooleanConditionComparisonOperator.LESS_THAN_OR_EQUAL
  },
  {
    label: '大于',
    value: BooleanConditionComparisonOperator.GREATER_THAN
  },
  {
    label: '大于等于',
    value: BooleanConditionComparisonOperator.GREATER_THAN_OR_EQUAL
  },
  {
    label: '包含',
    value: BooleanConditionComparisonOperator.IN,
    multi: true
  },
  {
    label: '不包含',
    value: BooleanConditionComparisonOperator.NOT_IN,
    multi: true
  },
  {
    label: '为空',
    value: BooleanConditionComparisonOperator.IS_NULL
  },
  {
    label: '非空',
    value: BooleanConditionComparisonOperator.NOT_NULL
  }
] as IOperatorSelectOption[];

export const DateBooleanCompareOperatorList = [
  {
    label: '等于',
    value: BooleanConditionComparisonOperator.DATE_EQUAL
  },
  {
    label: '不等于',
    value: BooleanConditionComparisonOperator.DATE_NOT_EQUAL
  },
  {
    label: '小于',
    value: BooleanConditionComparisonOperator.DATE_LESS_THAN
  },
  {
    label: '小于等于',
    value: BooleanConditionComparisonOperator.DATE_LESS_THAN_OR_EQUAL
  },
  {
    label: '大于',
    value: BooleanConditionComparisonOperator.DATE_GREATER_THAN
  },
  {
    label: '大于等于',
    value: BooleanConditionComparisonOperator.DATE_GREATER_THAN_OR_EQUAL
  },
  {
    label: '包含',
    value: BooleanConditionComparisonOperator.IN,
    multi: true
  },
  {
    label: '不包含',
    value: BooleanConditionComparisonOperator.NOT_IN,
    multi: true
  },
  {
    label: '为空',
    value: BooleanConditionComparisonOperator.IS_NULL
  },
  {
    label: '非空',
    value: BooleanConditionComparisonOperator.NOT_NULL
  }
] as IOperatorSelectOption[];
export const StringBooleanCompareOperatorList = [
  {
    label: '等于',
    value: BooleanConditionComparisonOperator.EQUAL
  },
  {
    label: '不等于',
    value: BooleanConditionComparisonOperator.NOT_EQUAL
  },
  {
    label: '包含',
    value: BooleanConditionComparisonOperator.LIST_IN,
    multi: true
  },
  {
    label: '不包含',
    value: BooleanConditionComparisonOperator.LIST_NOT_IN,
    multi: true
  },
  {
    label: '为空',
    value: BooleanConditionComparisonOperator.IS_BLANK
  },
  {
    label: '非空',
    value: BooleanConditionComparisonOperator.NOT_BLANK
  },
  {
    label: '包含',
    value: BooleanConditionComparisonOperator.LIKE,
    multi: false
  },
  {
    label: '开始于',
    value: BooleanConditionComparisonOperator.STARTS,
    multi: false
  },
  {
    label: '结束于',
    value: BooleanConditionComparisonOperator.ENDS,
    multi: false
  }
] as IOperatorSelectOption[];

/**
 * 业务类型对应的boolean运算符
 */
export const ExpressionTtypeXBooleanCompareOperatorListMap = {
  [ModelFieldType.UID]: [
    {
      label: '等于',
      value: BooleanConditionComparisonOperator.EQUAL
    },
    {
      label: '不等于',
      value: BooleanConditionComparisonOperator.NOT_EQUAL
    },
    {
      label: '包含',
      value: BooleanConditionComparisonOperator.IN,
      multi: true
    },
    {
      label: '不包含',
      value: BooleanConditionComparisonOperator.NOT_IN,
      multi: true
    },
    {
      label: '为空',
      value: BooleanConditionComparisonOperator.IS_NULL
    },
    {
      label: '非空',
      value: BooleanConditionComparisonOperator.NOT_NULL
    }
  ] as IOperatorSelectOption[],
  [ModelFieldType.Integer]: [...NumberBooleanCompareOperatorList],
  [ModelFieldType.Float]: [...NumberBooleanCompareOperatorList],
  [ModelFieldType.Currency]: [...NumberBooleanCompareOperatorList],
  [ModelFieldType.Boolean]: [
    {
      label: '等于',
      value: BooleanConditionComparisonOperator.EQUAL
    },
    {
      label: '不等于',
      value: BooleanConditionComparisonOperator.NOT_EQUAL
    },
    {
      label: '为空',
      value: BooleanConditionComparisonOperator.BOOL_IS_NULL
    },
    {
      label: '非空',
      value: BooleanConditionComparisonOperator.BOOL_NOT_NULL
    }
  ],
  [ModelFieldType.String]: [...StringBooleanCompareOperatorList],
  [ModelFieldType.Text]: [
    {
      label: '等于',
      value: BooleanConditionComparisonOperator.EQUAL
    },
    {
      label: '不等于',
      value: BooleanConditionComparisonOperator.NOT_EQUAL
    },
    {
      label: '为空',
      value: BooleanConditionComparisonOperator.IS_NULL
    },
    {
      label: '非空',
      value: BooleanConditionComparisonOperator.NOT_NULL
    },
    {
      label: '包含',
      value: BooleanConditionComparisonOperator.LIKE
    }
  ],
  [ModelFieldType.HTML]: [
    {
      label: '等于',
      value: BooleanConditionComparisonOperator.EQUAL
    },
    {
      label: '不等于',
      value: BooleanConditionComparisonOperator.NOT_EQUAL
    },
    {
      label: '为空',
      value: BooleanConditionComparisonOperator.IS_NULL
    },
    {
      label: '非空',
      value: BooleanConditionComparisonOperator.NOT_NULL
    },
    {
      label: '包含',
      value: BooleanConditionComparisonOperator.LIKE
    }
  ],
  [ModelFieldType.DateTime]: [...DateBooleanCompareOperatorList],
  [ModelFieldType.Year]: [...DateBooleanCompareOperatorList],
  [ModelFieldType.Date]: [...DateBooleanCompareOperatorList],
  [ModelFieldType.Time]: [...DateBooleanCompareOperatorList],
  [ModelFieldType.Phone]: [...StringBooleanCompareOperatorList],
  [ModelFieldType.Email]: [...StringBooleanCompareOperatorList],
  [ModelFieldType.Enum]: [
    // 只有二进制枚举有多值
    {
      label: '等于',
      value: BooleanConditionComparisonOperator.EQUAL
    },
    {
      label: '不等于',
      value: BooleanConditionComparisonOperator.NOT_EQUAL
    },
    {
      label: '为空',
      value: BooleanConditionComparisonOperator.IS_NULL
    },
    {
      label: '非空',
      value: BooleanConditionComparisonOperator.NOT_NULL
    },
    {
      label: '包含', // 二进制枚举
      value: BooleanConditionComparisonOperator.LIST_IN,
      // bitEnum: true
      multi: true
    },
    {
      label: '不包含', //二进制枚举
      value: BooleanConditionComparisonOperator.LIST_NOT_IN,
      // bitEnum: true
      multi: true
    },
    {
      label: '包含(多值)', //多值属于，二进制枚举
      value: BooleanConditionComparisonOperator.LIST_IN_LIST,
      // bitEnum: true,
      multi: true,
      rightArgMulti: true
    },
    {
      label: '不包含(多值)', //多值不属于，二进制枚举
      value: BooleanConditionComparisonOperator.LIST_NOT_IN_LIST,
      // bitEnum: true,
      multi: true,
      rightArgMulti: true
    }
  ] as IOperatorSelectOption[]
};

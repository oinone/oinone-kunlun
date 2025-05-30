import { ModelFieldType, isNumberTtype, isStringTtype, deepClone } from '@kunlun/meta';
import { Condition, DefaultComparisonOperator } from '@kunlun/request';
import { IExpSelectOption } from './Common';
import { IVariableItem, VariableItemType } from './ExpressionDefinition';
import { translateExpValue } from '../share';

// 需要包裹括号的比较运算符
export const WrapperCompareRsqlOperatorList = [
  DefaultComparisonOperator.IN,
  DefaultComparisonOperator.NOT_IN,
  DefaultComparisonOperator.HAS,
  DefaultComparisonOperator.HAS_NOT
].map((a) => a.toString());

// 没有右侧比较对象的比较运算符
export const NoRightCompareRsqlOperatorList = [
  DefaultComparisonOperator.IS_NULL,
  DefaultComparisonOperator.NOT_NULL
].map((a) => a.toString());

// 模糊匹配的运算符
export const RSQL_MATCH_COMPARE_OPERATOR_LIST = [
  DefaultComparisonOperator.LIKE,
  DefaultComparisonOperator.STARTS,
  DefaultComparisonOperator.ENDS
].map((a) => a.toString());

interface IExpRsqlSelectOption extends IExpSelectOption {
  multi?: boolean;
}

/**
 * 比较运算符
 * 等于、不等于、小于、小于等于、大于、大于等于、包含、不包含、为空、非空、包含（模糊匹配）、
 * 开始于、结束于、等于（字段）（该操作符之后仍然出现字段选择控件，可选字段与操作符左侧字段业务类型一致）
 * 、不等于（字段）、包含（属于in）、不包含（不属于in）
 */
export const ExpressionRsqlCompareOperatorList: IExpRsqlSelectOption[] = [
  {
    label: '等于',
    value: DefaultComparisonOperator.EQUAL
  },
  {
    label: '不等于',
    value: DefaultComparisonOperator.NOT_EQUAL
  },
  {
    label: '小于',
    value: DefaultComparisonOperator.LESS_THAN
  },
  {
    label: '小于等于',
    value: DefaultComparisonOperator.LESS_THAN_OR_EQUAL
  },
  {
    label: '大于',
    value: DefaultComparisonOperator.GREATER_THAN
  },
  {
    label: '大于等于',
    value: DefaultComparisonOperator.GREATER_THAN_OR_EQUAL
  }
];

/**
 * 逻辑运算符
 * 且 或
 */
export const ExpressionRsqlLogicOperatorList = [
  {
    label: '且',
    value: 'and'
  },
  {
    label: '或',
    value: 'or'
  }
];

const FieldCompareOperatorList = [
  {
    label: '等于',
    value: DefaultComparisonOperator.COL_EQUAL,
    type: VariableItemType.FIELD
  },
  {
    label: '不等于',
    value: DefaultComparisonOperator.COL_NOT_EQUAL,
    type: VariableItemType.FIELD
  }
];

const NumberCompareOperatorList = [
  ...FieldCompareOperatorList,
  {
    label: '等于',
    value: DefaultComparisonOperator.EQUAL
  },
  {
    label: '不等于',
    value: DefaultComparisonOperator.NOT_EQUAL
  },
  {
    label: '小于',
    value: DefaultComparisonOperator.LESS_THAN
  },
  {
    label: '小于等于',
    value: DefaultComparisonOperator.LESS_THAN_OR_EQUAL
  },
  {
    label: '大于',
    value: DefaultComparisonOperator.GREATER_THAN
  },
  {
    label: '大于等于',
    value: DefaultComparisonOperator.GREATER_THAN_OR_EQUAL
  },
  {
    label: '包含',
    value: DefaultComparisonOperator.LIKE,
    multi: true
  },
  {
    label: '不包含',
    value: DefaultComparisonOperator.NOT_LIKE,
    multi: true
  },
  {
    label: '为空',
    value: DefaultComparisonOperator.IS_NULL
  },
  {
    label: '非空',
    value: DefaultComparisonOperator.NOT_NULL
  }
  // {
  //   label: '等于',
  //   value: DefaultComparisonOperator.EQUAL + '_field',
  //   isField: true,
  // },
  // {
  //   label: '不等于',
  //   value: DefaultComparisonOperator.NOT_EQUAL + '_field',
  //   isField: true,
  // },
] as IExpRsqlSelectOption[];

const StringCompareOperatorList = [
  ...FieldCompareOperatorList,
  {
    label: '等于',
    value: DefaultComparisonOperator.EQUAL
  },
  {
    label: '不等于',
    value: DefaultComparisonOperator.NOT_EQUAL
  },
  {
    label: '包含',
    value: DefaultComparisonOperator.LIKE,
    multi: true
  },
  {
    label: '不包含',
    value: DefaultComparisonOperator.NOT_LIKE,
    multi: true
  },
  {
    label: '为空',
    value: DefaultComparisonOperator.IS_NULL
  },
  {
    label: '非空',
    value: DefaultComparisonOperator.NOT_NULL
  },
  {
    label: '包含',
    value: DefaultComparisonOperator.LIKE,
    multi: false
  },
  {
    label: '开始于',
    value: DefaultComparisonOperator.STARTS,
    multi: false
  },
  {
    label: '结束于',
    value: DefaultComparisonOperator.ENDS,
    multi: false
  }
  // {
  //   label: '等于',
  //   value: DefaultComparisonOperator.EQUAL + '_field',
  //   isField: true,
  // },
  // {
  //   label: '不等于',
  //   value: DefaultComparisonOperator.NOT_EQUAL + '_field',
  //   isField: true,
  // },
] as IExpRsqlSelectOption[];

/**
 * 业务类型对应的rsql运算符
 */
export const ExpressionTtypeXCompareOperatorListMap = {
  [ModelFieldType.UID]: [
    ...FieldCompareOperatorList,
    {
      label: '等于',
      value: DefaultComparisonOperator.EQUAL
    },
    {
      label: '不等于',
      value: DefaultComparisonOperator.NOT_EQUAL
    },
    {
      label: '包含',
      value: DefaultComparisonOperator.IN,
      multi: true
    },
    {
      label: '不包含',
      value: DefaultComparisonOperator.NOT_IN,
      multi: true
    },
    {
      label: '为空',
      value: DefaultComparisonOperator.IS_NULL
    },
    {
      label: '非空',
      value: DefaultComparisonOperator.NOT_NULL
    }
  ],
  [ModelFieldType.Integer]: [...NumberCompareOperatorList],
  [ModelFieldType.Float]: [...NumberCompareOperatorList],
  [ModelFieldType.Currency]: [...NumberCompareOperatorList],
  [ModelFieldType.Boolean]: [
    ...FieldCompareOperatorList,
    {
      label: '等于',
      value: DefaultComparisonOperator.EQUAL
    },
    {
      label: '不等于',
      value: DefaultComparisonOperator.NOT_EQUAL
    },
    {
      label: '包含',
      value: DefaultComparisonOperator.IN,
      multi: true
    },
    {
      label: '不包含',
      value: DefaultComparisonOperator.NOT_IN,
      multi: true
    },
    {
      label: '为空',
      value: DefaultComparisonOperator.IS_NULL
    },
    {
      label: '非空',
      value: DefaultComparisonOperator.NOT_NULL
    }
    // {
    //   label: '等于',
    //   value: DefaultComparisonOperator.EQUAL + '_field',
    //   isField: true,
    // },
    // {
    //   label: '不等于',
    //   value: DefaultComparisonOperator.NOT_EQUAL + '_field',
    //   isField: true,
    // },
  ],
  [ModelFieldType.String]: [...StringCompareOperatorList],
  [ModelFieldType.Text]: [
    ...FieldCompareOperatorList,
    {
      label: '等于',
      value: DefaultComparisonOperator.EQUAL
    },
    {
      label: '不等于',
      value: DefaultComparisonOperator.NOT_EQUAL
    },
    {
      label: '为空',
      value: DefaultComparisonOperator.IS_NULL
    },
    {
      label: '非空',
      value: DefaultComparisonOperator.NOT_NULL
    },
    {
      label: '包含',
      value: DefaultComparisonOperator.LIKE
    }
  ],
  [ModelFieldType.HTML]: [
    ...FieldCompareOperatorList,
    {
      label: '等于',
      value: DefaultComparisonOperator.EQUAL
    },
    {
      label: '不等于',
      value: DefaultComparisonOperator.NOT_EQUAL
    },
    {
      label: '为空',
      value: DefaultComparisonOperator.IS_NULL
    },
    {
      label: '非空',
      value: DefaultComparisonOperator.NOT_NULL
    },
    {
      label: '包含',
      value: DefaultComparisonOperator.LIKE
    }
  ],
  [ModelFieldType.DateTime]: [...NumberCompareOperatorList],
  [ModelFieldType.Year]: [...NumberCompareOperatorList],
  [ModelFieldType.Date]: [...NumberCompareOperatorList],
  [ModelFieldType.Time]: [...NumberCompareOperatorList],
  [ModelFieldType.Phone]: [...StringCompareOperatorList],
  [ModelFieldType.Email]: [...StringCompareOperatorList],
  [ModelFieldType.Enum]: [
    ...FieldCompareOperatorList,
    {
      label: '等于',
      value: DefaultComparisonOperator.EQUAL,
      multi: false
    },
    {
      label: '不等于',
      value: DefaultComparisonOperator.NOT_EQUAL,
      multi: false
    },
    {
      label: '为空',
      value: DefaultComparisonOperator.IS_NULL
    },
    {
      label: '非空',
      value: DefaultComparisonOperator.NOT_NULL
    },
    {
      // 普通单值枚举
      label: '包含',
      value: DefaultComparisonOperator.IN,
      bitEnum: false,
      multi: false
    },
    {
      // 普通单值枚举
      label: '不包含',
      value: DefaultComparisonOperator.NOT_IN,
      bitEnum: false,
      multi: false
    },
    {
      // 逗号分隔的多值枚举
      label: '包含',
      value: DefaultComparisonOperator.HAS,
      bitEnum: false,
      multi: true
    },
    {
      // 逗号分隔的多值枚举
      label: '不包含',
      value: DefaultComparisonOperator.HAS_NOT,
      bitEnum: false,
      multi: true
    },
    {
      // 二进制枚举
      label: '等于',
      value: DefaultComparisonOperator.BIT_EQUAL,
      bitEnum: true,
      multi: true
    },
    {
      // 二进制枚举
      label: '不等于',
      value: DefaultComparisonOperator.BIT_NOT_EQUAL,
      bitEnum: true,
      multi: true
    },
    {
      // 二进制枚举多值
      label: '包含',
      value: DefaultComparisonOperator.BIT_CONTAIN,
      bitEnum: true,
      multi: true
    },
    {
      // 二进制枚举多值
      label: '不包含',
      value: DefaultComparisonOperator.BIT_NOT_CONTAIN,
      bitEnum: true,
      multi: true
    }
  ]
};

function stringRsqlProcess(
  left: string,
  operator: string,
  right: string,
  isPreprocess: boolean,
  leftFieldItem: IVariableItem
) {
  if (leftFieldItem.multi) {
    if (isStringTtype(leftFieldItem?.ttype) || isNumberTtype(leftFieldItem?.ttype)) {
      right = `\\"${right}\\"`;
    }
  }
  return right;
}

function stringArrayRsqlProcess(
  left: string,
  operator: string,
  right: string,
  isPreprocess: boolean,
  leftFieldItem: IVariableItem,
  rightItemList: IVariableItem[]
) {
  if (leftFieldItem.multi) {
    if (
      rightItemList.length === 1 &&
      rightItemList[0].type === VariableItemType.STRING &&
      (isStringTtype(leftFieldItem?.ttype) || isNumberTtype(leftFieldItem?.ttype))
    ) {
      right = `[\\"${right}\\"]`;
    }
  }
  return right;
}

type ConditionRsqlFunction = (
  left: string,
  operator: string,
  right: string,
  isPreprocess: boolean,
  leftFieldItem: IVariableItem,
  rightItemList: IVariableItem[]
) => string;

export const ConditionRsqlFunctionMap = new Map<DefaultComparisonOperator | string, ConditionRsqlFunction>();
ConditionRsqlFunctionMap.set(DefaultComparisonOperator.IN, (left: string, operator: string, right: string) => {
  return new Condition(left).in(right).toString();
});
ConditionRsqlFunctionMap.set(DefaultComparisonOperator.NOT_IN, (left: string, operator: string, right: string) => {
  return new Condition(left).notIn(right).toString();
});
ConditionRsqlFunctionMap.set(DefaultComparisonOperator.IS_NULL, (left: string) => {
  return new Condition(left).isNull().toString();
});
ConditionRsqlFunctionMap.set(DefaultComparisonOperator.NOT_NULL, (left: string) => {
  return new Condition(left).notNull().toString();
});
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.EQUAL,
  (
    left: string,
    operator: string,
    right: string,
    isPreprocess: boolean,
    leftFieldItem: IVariableItem,
    rightItemList: IVariableItem[]
  ) => {
    right = stringArrayRsqlProcess(left, operator, right, isPreprocess, leftFieldItem, rightItemList);
    return new Condition(left).equal(right, isPreprocess).toString();
  }
);
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.NOT_EQUAL,
  (
    left: string,
    operator: string,
    right: string,
    isPreprocess: boolean,
    leftFieldItem: IVariableItem,
    rightItemList: IVariableItem[]
  ) => {
    right = stringArrayRsqlProcess(left, operator, right, isPreprocess, leftFieldItem, rightItemList);
    return new Condition(left).notEqual(right, isPreprocess).toString();
  }
);
ConditionRsqlFunctionMap.set(DefaultComparisonOperator.COL_EQUAL, (left: string, operator: string, right: string) => {
  return new Condition(left).colEqual(right).toString();
});
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.COL_NOT_EQUAL,
  (left: string, operator: string, right: string) => {
    return new Condition(left).colNotEqual(right).toString();
  }
);
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.HAS,
  (left: string, operator: string, right: string, isProcess: boolean, leftFieldItem: IVariableItem) => {
    return new Condition(left).has(right).toString();
  }
);
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.HAS_NOT,
  (left: string, operator: string, right: string, isProcess: boolean, leftFieldItem: IVariableItem) => {
    return new Condition(left).hasNot(right).toString();
  }
);
ConditionRsqlFunctionMap.set(DefaultComparisonOperator.BIT_EQUAL, (left: string, operator: string, right: string) => {
  return new Condition(left).bitEqual(right).toString();
});
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.BIT_NOT_EQUAL,
  (left: string, operator: string, right: string) => {
    return new Condition(left).bitNotEqual(right).toString();
  }
);
ConditionRsqlFunctionMap.set(DefaultComparisonOperator.BIT_CONTAIN, (left: string, operator: string, right: string) => {
  return new Condition(left).bitContain(right).toString();
});
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.BIT_NOT_CONTAIN,
  (left: string, operator: string, right: string) => {
    return new Condition(left).bitNotContain(right).toString();
  }
);
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.LIKE,
  (left: string, operator: string, right: string, isProcess: boolean, leftFieldItem: IVariableItem) => {
    right = stringRsqlProcess(left, operator, right, isProcess, leftFieldItem);
    return new Condition(left).like(right).toString();
  }
);
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.NOT_LIKE,
  (left: string, operator: string, right: string, isProcess: boolean, leftFieldItem: IVariableItem) => {
    right = stringRsqlProcess(left, operator, right, isProcess, leftFieldItem);
    return new Condition(left).notLike(right).toString();
  }
);
ConditionRsqlFunctionMap.set(DefaultComparisonOperator.STARTS, (left: string, operator: string, right: string) => {
  return new Condition(left).like(right).toString();
});
ConditionRsqlFunctionMap.set(DefaultComparisonOperator.ENDS, (left: string, operator: string, right: string) => {
  return new Condition(left).like(right).toString();
});
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.GREATER_THAN,
  (left: string, operator: string, right: string) => {
    return new Condition(left).greaterThan(right).toString();
  }
);
ConditionRsqlFunctionMap.set(DefaultComparisonOperator.LESS_THAN, (left: string, operator: string, right: string) => {
  return new Condition(left).lessThan(right).toString();
});
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.GREATER_THAN_OR_EQUAL,
  (left: string, operator: string, right: string) => {
    return new Condition(left).greaterThanOrEuqalTo(right).toString();
  }
);
ConditionRsqlFunctionMap.set(
  DefaultComparisonOperator.LESS_THAN_OR_EQUAL,
  (left: string, operator: string, right: string) => {
    return new Condition(left).lessThanOrEqualTo(right).toString();
  }
);

export const CURRENT_USER_PLACEHOLDER = 'currentUser';

export const CURRENT_USER_FRONT_EXPRESSION = `$#{${CURRENT_USER_PLACEHOLDER}}`;

export const CURRENT_USER_BACKEND_EXPRESSION = `\$\{${CURRENT_USER_PLACEHOLDER}}`;

/**
 * please using {@link CURRENT_USER_FRONT_EXPRESSION}
 */
export enum SessionContextEnum {
  // 当前登录用户
  currentUser = '$#{currentUser}'
}

export const currentUserOption = {
  ttype: ModelFieldType.String,
  value: CURRENT_USER_FRONT_EXPRESSION,
  displayName: '当前登录用户',
  label: '当前登录用户'
};

export type SessionContextOption = typeof currentUserOption;

export const SessionContextOptions: SessionContextOption[] = [currentUserOption];

export function buildSessionContextOptions(options?: SessionContextOption[]): SessionContextOption[] {
  const list = deepClone(options || SessionContextOptions);
  list.forEach((a) => {
    a.displayName = translateExpValue(a.displayName);
    a.label = translateExpValue(a.label);
  });
  return list;
}

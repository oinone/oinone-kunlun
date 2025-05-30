import { ModelFieldType } from '@kunlun/meta';

/**
 * 表达式运算符
 * 等于、不等于、小于、小于等于、大于、大于等于、加上、减去、乘以、除以、取余。
 */

const ExpressionCompareExpressionOperatorList = [
  {
    label: '等于',
    value: '=='
  },
  {
    label: '不等于',
    value: '!='
  },
  {
    label: '小于',
    value: '<'
  },
  {
    label: '小于等于',
    value: '<='
  },
  {
    label: '大于',
    value: '>'
  },
  {
    label: '大于等于',
    value: '>='
  }
];

const ExpressionLogicExpressionOperatorList = [
  {
    label: '且',
    value: '&&'
  },
  {
    label: '或',
    value: '||'
  }
];

const ExpressionCalculateExpressionOperatorList = [
  {
    label: '加上',
    value: '+'
  },
  {
    label: '减去',
    value: '-'
  },
  {
    label: '乘以',
    value: '*'
  },
  {
    label: '除以',
    value: '/'
  },
  {
    label: '取余',
    value: '%'
  },
  ...ExpressionLogicExpressionOperatorList
];

export const ExpressionOperatorConfig = [
  {
    label: '等于',
    value: '=='
  },
  {
    label: '不等于',
    value: '!='
  },
  {
    label: '小于',
    value: '<'
  },
  {
    label: '小于等于',
    value: '<='
  },
  {
    label: '大于',
    value: '>'
  },
  {
    label: '大于等于',
    value: '>='
  },
  {
    label: '加上',
    value: '+'
  },
  {
    label: '减去',
    value: '-'
  },
  {
    label: '乘以',
    value: '*'
  },
  {
    label: '除以',
    value: '/'
  },
  {
    label: '取余',
    value: '%'
  },
  ...ExpressionLogicExpressionOperatorList
];

const ExpressionDateOperatorList = [
  {
    label: '等于',
    value: '=='
    // value: 'DATE_EQUAL'
  },
  {
    label: '不等于',
    value: '!='
    // value: '!DATE_EQUAL'
  },
  {
    label: '小于',
    value: '<'
    // value: 'LESS_THAN'
  },
  {
    label: '小于等于',
    value: '<='
    // value: 'LESS_EQUAL'
  },
  {
    label: '大于',
    value: '>'
    // value: 'GREATER_EQUAL'
  },
  {
    label: '大于等于',
    value: '>='
    // value: 'GREATER_EQUAL'
  },
  ...ExpressionLogicExpressionOperatorList
];

export const ExpressionTtypeXExpressionOperatorListMap = {
  [ModelFieldType.UID]: [
    ...ExpressionCompareExpressionOperatorList,
    {
      label: '取余',
      value: '%'
    },
    ...ExpressionLogicExpressionOperatorList
  ],
  [ModelFieldType.Integer]: [...ExpressionCompareExpressionOperatorList, ...ExpressionCalculateExpressionOperatorList],
  [ModelFieldType.Float]: [...ExpressionCompareExpressionOperatorList, ...ExpressionCalculateExpressionOperatorList],
  [ModelFieldType.Currency]: [...ExpressionCompareExpressionOperatorList, ...ExpressionCalculateExpressionOperatorList],
  [ModelFieldType.Boolean]: [
    {
      label: '等于',
      value: '=='
    },
    {
      label: '不等于',
      value: '!='
    },
    ...ExpressionLogicExpressionOperatorList
  ],
  [ModelFieldType.String]: [
    {
      label: '等于',
      value: '=='
    },
    {
      label: '不等于',
      value: '!='
    },
    {
      label: '加上',
      value: '+'
    },
    ...ExpressionLogicExpressionOperatorList
  ],
  [ModelFieldType.Text]: [
    {
      label: '加上',
      value: '+'
    },
    ...ExpressionLogicExpressionOperatorList
  ],
  [ModelFieldType.HTML]: [
    {
      label: '加上',
      value: '+'
    },
    ...ExpressionLogicExpressionOperatorList
  ],
  [ModelFieldType.DateTime]: [...ExpressionDateOperatorList],
  [ModelFieldType.Year]: [...ExpressionDateOperatorList],
  [ModelFieldType.Date]: [...ExpressionDateOperatorList],
  [ModelFieldType.Time]: [...ExpressionDateOperatorList],
  [ModelFieldType.Phone]: [
    {
      label: '等于',
      value: '=='
    },
    {
      label: '不等于',
      value: '!='
    },
    ...ExpressionLogicExpressionOperatorList
  ],
  [ModelFieldType.Email]: [
    {
      label: '等于',
      value: '=='
    },
    {
      label: '不等于',
      value: '!='
    },
    ...ExpressionLogicExpressionOperatorList
  ],
  [ModelFieldType.Enum]: [
    {
      label: '等于',
      value: '=='
    },
    {
      label: '不等于',
      value: '!='
    },
    ...ExpressionLogicExpressionOperatorList
  ]
};

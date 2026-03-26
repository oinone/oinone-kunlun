export const EXPRESSION_LOCALE = {
  token: {
    activeRecords: '[Current View Dataset]',
    activeRecord: '[Current View Data]',
    rootRecord: '[Main View Data]'
  },
  operator: {
    '+': 'plus',
    '-': 'minus',
    '*': 'multiply by',
    '/': 'divide by',
    '%': 'modulo',
    '<': 'less than',
    '<=': 'less than or equal to',
    '>': 'greater than',
    '>=': 'greater than or equal to',
    '==': 'equals',
    '===': 'strictly equals',
    '!=': 'not equals',
    '!==': 'strictly not equals',
    '&': 'bitwise AND',
    '|': 'bitwise OR',
    '!': 'NOT',
    '^': 'bitwise XOR',
    '&&': 'AND',
    '||': 'OR'
  },
  /**
   * 函数支持使用args上下文参数进行格式化
   */
  function: {
    // 数学函数
    ABS: 'Absolute value',
    FLOOR: 'Round down',
    CEIL: 'Round up',
    ROUND: 'Round',
    MOD: 'Modulo',
    SQRT: 'Square root',
    SIN: 'Sine',
    COS: 'Cosine',
    PI: 'Pi',
    ADD: 'Add',
    SUBTRACT: 'Subtract',
    MULTIPLY: 'Multiply',
    DIVIDE: 'Divide',
    MAX: 'Maximum',
    MIN: 'Minimum',
    SUM: 'Sum',
    AVG: 'Average',
    COUNT: 'Count',
    UPPER_MONEY: 'Uppercase amount',

    // 文本函数
    TRIM: 'Trim spaces',
    IS_BLANK: 'Is blank string',
    STARTS_WITH: 'Starts with',
    ENDS_WITH: 'Ends with',
    CONTAINS: 'Contains',
    STR_LIST_CONTAINS: '', // fixme @zbh 20231125 后端无对应函数
    LOWER: 'Lowercase',
    UPPER: 'Uppercase',
    REPLACE: 'Replace string',
    LEN: 'String length',
    JOIN: 'Join string',
    PARSE: 'Deserialize JSON string',
    JSON: 'Serialize record to JSON string',
    SUBSTRING: 'Substring', // fixme @zbh 20231125 后端无对应函数
    TO_NUMBER: 'Convert to number',

    // 正则函数
    MATCHES: 'Regex match',
    CHECK_PHONE: 'Validate phone number',
    CHECK_EMAIL: 'Validate email format',
    CHECK_USER_NAME: 'Validate username',
    CHECK_PWD: 'Strong password validation',
    CHECK_INTEGER: 'Validate integer format',
    CHECK_ID_CARD: 'Validate Chinese ID card format',
    CHECK_URL: 'Validate URL format',
    CHECK_CHINESE: 'Validate Chinese format',
    CHECK_NUMBER: 'Validate number format',
    CHECK_TWO_DIG: 'Validate two decimal places',
    CHECK_IP: 'Validate IP address',
    CHECK_CONTAINS_CHINESE: 'Validate contains Chinese',
    CHECK_CODE: 'Validate code',
    CHECK_ENG_NUM: 'Validate format', // fixme @zbh 20231125 语义不明确，函数语义为: 仅包含英文和数字
    CHECK_SIZE: 'Validate character range',
    CHECK_MIN_SIZE: 'Validate character range', // fixme @zbh 20231125 语义不明确
    CHECK_MAX_SIZE: 'Validate character range', // fixme @zbh 20231125 语义不明确
    CHECK_SIZE_RANGE: 'Validate character range', // fixme @zbh 20231125 语义不明确

    // 时间函数
    NOW: 'Return current time',
    NOW_STR: 'Return current time string',
    TODAY_STR: "Return today's date string",
    TO_DATE: 'Convert to time',
    ADD_DAY: 'Add/subtract specified days', // fixme @zbh 20231125 语义不明确
    ADD_MONTH: 'Add/subtract specified months', // fixme @zbh 20231125 语义不明确
    ADD_YEAR: 'Add/subtract specified years', // fixme @zbh 20231125 语义不明确
    SUB_DATETIME_TO_SECOND: 'Time subtraction (seconds)', // fixme @zbh 20231125 前端无对应函数
    SUB_DATETIME_TO_DDHHMMSS: 'Time subtraction (DD days HH hours MM mins SS secs)', // fixme @zbh 20231125 前端无对应函数
    GREATER_THAN: 'Greater than',
    GREATER_EQUAL: 'Greater than or equal to',
    ADD_WORK_DAY: 'Add/subtract workdays (skip weekends)',
    COUNT_DAY: 'Days between dates',
    LESS_THAN: 'Less than',
    LESS_EQUAL: 'Less than or equal to',
    DATE_EQUALS: 'Equals',

    // 集合函数
    LIST_GET: 'Get collection (or array) element',
    LIST_IS_EMPTY: 'Is collection (or array) empty',
    LIST_CONTAINS: 'Does collection (or array) contain element',
    LIST_ADD: 'Add element to collection (or array)',
    LIST_ADD_BY_INDEX: 'Add element to specific position in collection (or array)',
    LIST_REMOVE: 'Remove element from collection (or array)',
    LIST_COUNT: 'Get collection (or array) element count',
    LIST_IDS: 'Get all IDs in collection',
    LIST_FIELD_VALUES: 'Convert object collection to property collection',
    LIST_FIELD_EQUALS: 'Check if property values match in object collection (or array)',
    LIST_FIELD_NOT_EQUALS: 'Check if property values mismatch in object collection (or array)',
    LIST_FIELD_IN: 'Check if property values are in specified collection (or array)',
    LIST_FIELD_NOT_IN: 'Check if property values are not in specified collection (or array)',
    LIST_AND: 'Logical AND operation on boolean collection',
    LIST_OR: 'Logical OR operation on boolean collection',
    STRING_LIST_TO_NUMBER_LIST: 'Convert text to number', // fixme @zbh 20231125 后端无对应函数
    COMMA: 'Concatenate result set with commas',
    CONCAT: 'Concatenate result set with specified separator',

    // 键值对函数
    MAP_GET: 'Get value by key from key-value pair',
    MAP_IS_EMPTY: 'Is key-value pair empty',
    MAP_CONTAINS_KEY: 'Does key-value pair contain key',
    MAP_PUT: 'Add key-value to key-value pair',
    MAP_REMOVE: 'Remove element from key-value pair',
    MAP_COUNT: 'Get key-value count',

    // 对象函数
    IS_NULL: 'Is null',
    EQUALS: 'Is equal',
    GET: 'Get object property value',
    FIELD_GET: 'Get object property value by field code', // fixme @zbh 20231125 函数签名发生变化，与后端保持一致

    // 上下文函数
    // fixme @zbh 20231125 前端无法实现
    CURRENT_PARTNER_ID: "Get current user's partner ID",
    CURRENT_DEPARTMENT: "Get current user's department",
    CURRENT_CORP_ID: "Get current user's company ID",
    CURRENT_CORP: "Get current user's company",
    CURRENT_USER_NAME: 'Get current username',
    CURRENT_UID: 'Get current user ID',
    CURRENT_SHOP: "Get current user's shop",
    CURRENT_ROLE_IDS: "Get current user's role ID list",
    CURRENT_DEPARTMENT_CODE: "Get current user's department code",
    CURRENT_SHOP_ID: "Get current user's shop ID",
    CURRENT_ROLES: "Get current user's role list",
    CURRENT_USER: 'Get current user',
    CURRENT_PARTNER: 'Get current partner',

    // 逻辑函数
    IF: 'Conditional function',
    // IF: "args.length === 3 ? `If ${args[0]} is true, then ${args[1]}, else ${args[2]}` : `Conditional function(${args.join(', ')})`",
    AND: 'Logical AND',
    OR: 'Logical OR',
    NOT: 'Logical NOT'
  }
};

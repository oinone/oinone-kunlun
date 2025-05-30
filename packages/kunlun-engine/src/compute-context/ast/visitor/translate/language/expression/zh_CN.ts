export const EXPRESSION_LOCALE = {
  token: {
    activeRecords: '当前视图数据集',
    activeRecord: '当前视图数据',
    rootRecord: '主视图数据'
  },
  operator: {
    '+': '加上',
    '-': '减去',
    '*': '乘以',
    '/': '除以',
    '%': '取余',
    '<': '减去',
    '<=': '减去',
    '>': '减去',
    '>=': '减去',
    '==': '等于',
    '===': '等于',
    '!=': '减去',
    '!==': '减去',
    '&': '与',
    '|': '或',
    '!': '非',
    '^': '异或',
    '&&': '且',
    '||': '或'
  },
  /**
   * 函数支持使用args上下文参数进行格式化
   */
  function: {
    // 数学函数
    ABS: '绝对值',
    FLOOR: '向下取整',
    CEIL: '向上取整',
    ROUND: '四舍五入',
    MOD: '取余',
    SQRT: '平方根',
    SIN: '正弦',
    COS: '余弦',
    PI: '圆周率',
    ADD: '相加',
    SUBTRACT: '相减',
    MULTIPLY: '乘积',
    DIVIDE: '相除',
    MAX: '取最大值',
    MIN: '取最小值',
    SUM: '求和',
    AVG: '取平均值',
    COUNT: '计数',
    UPPER_MONEY: '大写金额',

    // 文本函数
    TRIM: '过滤首尾空格',
    IS_BLANK: '是否为空字符串',
    STARTS_WITH: '是否以指定字符串开始',
    ENDS_WITH: '是否以指定字符串结束',
    CONTAINS: '包含',
    STR_LIST_CONTAINS: '', // fixme @zbh 20231125 后端无对应函数
    LOWER: '小写',
    UPPER: '大写',
    REPLACE: '替换字符串',
    LEN: '获取字符串长度',
    JOIN: '连接字符串',
    PARSE: '反序列化JSON字符串',
    JSON: '将记录序列化为JSON字符串',
    SUBSTRING: '截取', // fixme @zbh 20231125 后端无对应函数
    TO_NUMBER: '转换为数字',

    // 正则函数
    MATCHES: '正则匹配',
    CHECK_PHONE: '校验手机号',
    CHECK_EMAIL: '校验邮箱的格式',
    CHECK_USER_NAME: '校验用户名',
    CHECK_PWD: '强密码校验',
    CHECK_INTEGER: '校验整数格式',
    CHECK_ID_CARD: '校验中国身份证格式',
    CHECK_URL: '校验URL格式',
    CHECK_CHINESE: '校验是否是中文格式',
    CHECK_NUMBER: '校验数字格式',
    CHECK_TWO_DIG: '验证是否两位小数',
    CHECK_IP: 'IP地址校验',
    CHECK_CONTAINS_CHINESE: '是否包含中文校验',
    CHECK_CODE: '校验编码',
    CHECK_ENG_NUM: '校验格式', // fixme @zbh 20231125 语义不明确，函数语义为: 仅包含英文和数字
    CHECK_SIZE: '校验字符范围',
    CHECK_MIN_SIZE: '校验字符范围', // fixme @zbh 20231125 语义不明确
    CHECK_MAX_SIZE: '校验字符范围', // fixme @zbh 20231125 语义不明确
    CHECK_SIZE_RANGE: '校验字符范围', // fixme @zbh 20231125 语义不明确

    // 时间函数
    NOW: '返回当前时间',
    NOW_STR: '返回当前时间字符串',
    TODAY_STR: '返回今天的日期字符串',
    TO_DATE: '转换为时间',
    ADD_DAY: '加减指定天数', // fixme @zbh 20231125 语义不明确
    ADD_MONTH: '加减指定月数', // fixme @zbh 20231125 语义不明确
    ADD_YEAR: '加减指定年数', // fixme @zbh 20231125 语义不明确
    SUB_DATETIME_TO_SECOND: '时间相减(得到秒)', // fixme @zbh 20231125 前端无对应函数
    SUB_DATETIME_TO_DDHHMMSS: '时间相减(得到：DD天HH小时MM分SS秒)', // fixme @zbh 20231125 前端无对应函数
    GREATER_THAN: '大于',
    GREATER_EQUAL: '大于等于',
    ADD_WORK_DAY: '工作日加减天数(跳过周末)',
    COUNT_DAY: '日期相隔天数',
    LESS_THAN: '小于',
    LESS_EQUAL: '小于等于',
    DATE_EQUALS: '等于',

    // 集合函数
    LIST_GET: '获取集合(或数组)元素',
    LIST_IS_EMPTY: '判断集合(或数组)是否为空',
    LIST_CONTAINS: '判断集合(或数组)是否包含元素',
    LIST_ADD: '将元素添加到集合(或数组)',
    LIST_ADD_BY_INDEX: '将元素添加到集合(或数组)的指定位置',
    LIST_REMOVE: '移除集合(或数组)中的元素',
    LIST_COUNT: '获取集合(或数组)元素数量',
    LIST_IDS: '获取集合中的所有id',
    LIST_FIELD_VALUES: '将对象集合转化为属性集合',
    LIST_FIELD_EQUALS: '判断对象集合(或数组)中属性值匹配情况',
    LIST_FIELD_NOT_EQUALS: '判断对象集合(或数组)中属性值不匹配情况',
    LIST_FIELD_IN: '判断对象集合(或数组)中属性值是否在指定集合(或数组)中',
    LIST_FIELD_NOT_IN: '判断对象集合(或数组)中属性值是否不在指定集合(或数组)中',
    LIST_AND: '将一个布尔集合进行逻辑与运算',
    LIST_OR: '将一个布尔集合进行逻辑或运算',
    STRING_LIST_TO_NUMBER_LIST: '文本转数字', // fixme @zbh 20231125 后端无对应函数
    COMMA: '使用逗号拼接结果集',
    CONCAT: '指定分隔符拼接结果集',

    // 键值对函数
    MAP_GET: '从键值对中获取指定键的值',
    MAP_IS_EMPTY: '判断键值对是否为空',
    MAP_CONTAINS_KEY: '判断键值对中是否包含键',
    MAP_PUT: '向键值对中添加键值',
    MAP_REMOVE: '移除键值对中的元素',
    MAP_COUNT: '获取键值数量',

    // 对象函数
    IS_NULL: '判断是否为空',
    EQUALS: '判断是否相等',
    GET: '获取对象属性值',
    FIELD_GET: '根据字段编码获取对象属性值', // fixme @zbh 20231125 函数签名发生变化，与后端保持一致

    // 上下文函数
    // fixme @zbh 20231125 前端无法实现
    CURRENT_PARTNER_ID: '获取当前用户的合作伙伴id',
    CURRENT_DEPARTMENT: '获取当前用户的合作伙伴id',
    CURRENT_CORP_ID: '获取当前用户的部门',
    CURRENT_CORP: '获取当前用户的公司id',
    CURRENT_USER_NAME: '获取当前用户的公司',
    CURRENT_UID: '获取当前用户名',
    CURRENT_SHOP: '获取当前用户id',
    CURRENT_ROLE_IDS: '获取当前用户的店铺',
    CURRENT_DEPARTMENT_CODE: '获取当前用户的角色id列表',
    CURRENT_SHOP_ID: '获取当前用户部门编码',
    CURRENT_ROLES: '获取当前用户的店铺id',
    CURRENT_USER: '获取当前用户的角色列表',
    CURRENT_PARTNER: '获取当前用户',

    // 逻辑函数
    IF: '条件函数',
    // IF: "args.length === 3 ? `如果 ${args[0]} 成立, 则 ${args[1]}, 否则 ${args[2]}` : `条件函数(${args.join(', ')})`",
    AND: '逻辑与',
    OR: '逻辑或',
    NOT: '逻辑非'
  }
};

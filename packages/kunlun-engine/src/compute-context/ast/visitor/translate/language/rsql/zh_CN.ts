import { EXPRESSION_LOCALE as BASE } from '../expression/zh_CN';

export const EXPRESSION_LOCALE = {
  ...BASE,
  token: {
    ...BASE.token,
    currentUser: '当前登录用户'
  },
  operator: {
    ...BASE.operator,
    '=gt=': '大于',
    '=ge=': '大于等于',
    '=lt=': '小于',
    '=le=': '小于等于',
    '=in=': '包含',
    '=out=': '不包含',
    '=isnull=': '为空',
    '=notnull=': '非空',
    '=cole=': '等于',
    '=colnot=': '不等于',
    '=like=': '包含',
    '=starts=': '开始于',
    '=ends=': '结束于',
    '=notlike=': '不包含',
    '=notstarts=': '`不以 ${args[0]} 开始`',
    '=notends=': '`不以 ${args[0]} 结束`',
    '=has=': '包含',
    '=hasnt=': '不包含',
    '=bit=': '等于',
    '=notbit=': '不等于',
    and: '且',
    or: '或'
  }
};

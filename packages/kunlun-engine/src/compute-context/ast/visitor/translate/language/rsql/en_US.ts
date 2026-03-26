import { EXPRESSION_LOCALE as BASE } from '../expression/en_US';

export const EXPRESSION_LOCALE = {
  ...BASE,
  token: {
    ...BASE.token,
    currentUser: 'Current logged-in user'
  },
  operator: {
    ...BASE.operator,
    '=gt=': 'greater than',
    '=ge=': 'greater than or equal to',
    '=lt=': 'less than',
    '=le=': 'less than or equal to',
    '=in=': 'in',
    '=out=': 'not in',
    '=isnull=': 'is null',
    '=notnull=': 'is not null',
    '=cole=': 'equals',
    '=colnot=': 'not equals',
    '=like=': 'contains',
    '=starts=': 'starts with',
    '=ends=': 'ends with',
    '=notlike=': 'does not contain',
    '=notstarts=': '`does not start with ${args[0]}`',
    '=notends=': '`does not end with ${args[0]}`',
    '=has=': 'has',
    '=hasnt=': 'does not have',
    '=bit=': 'bitwise equals',
    '=notbit=': 'bitwise not equals',
    and: 'AND',
    or: 'OR'
  }
};

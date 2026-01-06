import {
  DEFAULT_CONDITION,
  DEFAULT_FALSE_CONDITION,
  DEFAULT_LIST_TRUE_CONDITION,
  DEFAULT_TRUE_CONDITION
} from '../index';

describe('request 常量', () => {
  it('默认条件常量一致', () => {
    expect(DEFAULT_TRUE_CONDITION).toBe('1==1');
    expect(DEFAULT_CONDITION).toBe(DEFAULT_TRUE_CONDITION);
    expect(DEFAULT_FALSE_CONDITION).toBe('1!=1');
    expect(DEFAULT_LIST_TRUE_CONDITION).toBe('(1==1) and (1==1)');
  });
});

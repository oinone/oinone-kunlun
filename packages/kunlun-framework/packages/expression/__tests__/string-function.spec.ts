import { STRING_FUNCTION } from '../index';

describe('STRING_FUNCTION 字符串函数', () => {
  it('TRIM 与 IS_BLANK 行为正确', () => {
    expect(STRING_FUNCTION.TRIM(' a ')).toBe('a');
    expect(STRING_FUNCTION.TRIM(null as any)).toBeNull();
    expect(STRING_FUNCTION.IS_BLANK(' ')).toBe(true);
    expect(STRING_FUNCTION.IS_BLANK('a')).toBe(false);
  });

  it('SPLIT 可以拆分并去除空白', () => {
    expect(STRING_FUNCTION.SPLIT('a, b , ,c', ',')).toEqual(['a', 'b', 'c']);
  });

  it('INDEXOF 返回正确的索引', () => {
    expect(STRING_FUNCTION.INDEXOF('abc', 'b')).toBe(1);
    expect(STRING_FUNCTION.INDEXOF('abc', 'd')).toBe(-1);
  });
});

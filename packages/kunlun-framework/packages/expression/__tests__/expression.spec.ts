import { Expression } from '../index';

describe('Expression 执行', () => {
  it('支持基本数学表达式计算', () => {
    const expression = Expression.getInstance();
    const result = expression.exec('1 + 2 * 3');
    expect(result).toBe(7);
  });

  it('支持内置函数 ADD 与 TRIM', () => {
    const expression = Expression.getInstance();
    const addResult = expression.exec('ADD(1, 2)');
    const trimResult = expression.exec('TRIM(" a ")');

    expect(addResult).toBe(3);
    expect(trimResult).toBe('a');
  });

  it('全中文或单个操作符直接返回原始字符串', () => {
    const expression = Expression.getInstance();

    expect(expression.exec('你好世界')).toBe('你好世界');
    expect(expression.exec('+')).toBe('+');
  });
});

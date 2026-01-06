import { ConditionBuilder } from '../src/condition/condition-builder';

describe('ConditionBuilder', () => {
  const cb = ConditionBuilder.getInstance();

  it('struct 过滤空值并生成对象结构字符串', () => {
    const result = cb.struct({
      a: cb.condition('a').equal('1'),
      b: '',
      c: cb.raw('now()'),
      d: undefined,
      e: null
    });
    expect(result).toBe('{a:"a==\'1\'",c:now(),}');
  });

  it('comma 返回逗号分隔字符串', () => {
    expect(cb.comma('a', 'b', 'c')).toBe('a,b,c');
  });

  it('aggs 在传入聚合配置时生成聚合协议字符串', () => {
    const aggs = cb.aggs({ field: 'amount', method: 'sum', alias: 'total' });
    expect(aggs).toBe('amount=sum=total');
    expect(cb.aggs()).toBe('');
  });

  it('pk 使用多个主键构建 Condition', () => {
    const condition = cb.pk(['id', 'tenant'], { id: 1, tenant: 't1' });
    expect(condition.toString()).toBe("(id) and (tenant=='t1')");
  });

  it('pk 缺少主键值时抛出错误', () => {
    expect(() => cb.pk(['id', 'tenant'], { id: 1 })).toThrowError(/Primary key joint error/);
  });
});

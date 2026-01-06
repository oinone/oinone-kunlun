import { StringHelper } from '../index';

describe('StringHelper', () => {
  it('camelCaseToKebabCase 与 kebabCaseToCamelCase 可互转', () => {
    const kebab = StringHelper.camelCaseToKebabCase('helloWorldTest');
    expect(kebab).toBe('hello-world-test');
    expect(StringHelper.kebabCaseToCamelCase(kebab)).toBe('helloWorldTest');
  });

  it('convertArray 支持字符串与数组输入', () => {
    expect(StringHelper.convertArray('a,b , c')).toEqual(['a', 'b', 'c']);
    expect(StringHelper.convertArray(['a', ' ', 'b'])).toEqual(['a', '', 'b']);
  });

  it('getOrDefault 使用默认值', () => {
    expect(StringHelper.getOrDefault(null, 'd')).toBe('d');
    expect(StringHelper.getOrDefault('v', 'd')).toBe('v');
  });

  it('setter 在非空时调用回调', () => {
    const values: string[] = [];
    StringHelper.setter('v', (s) => values.push(s));
    StringHelper.setter('', (s) => values.push(s));
    expect(values).toEqual(['v']);
  });

  it('random 返回指定长度的字符串', () => {
    const value = StringHelper.random(10);
    expect(value).toHaveLength(10);
  });
});

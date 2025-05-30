/**
 * @jest-environment jsdom
 */

import { ApolloClient } from 'apollo-client';
import { HttpClient } from '../client';

jest.mock('../license', () => ({
  ...jest.requireActual('../license'),
  verify: () => {}
}));

describe('HttpClient', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = HttpClient.getInstance();
    httpClient.setBaseURL('https://api.example.com');
    httpClient.setHeaders({ 'X-Custom-Header': 'test' });
    httpClient.setEncodeRsql(true);
    httpClient.setEnableTranslate(false);
  });

  // 测试单例模式
  test('should return same instance', () => {
    const anotherInstance = HttpClient.getInstance();
    expect(anotherInstance).toBe(httpClient);
  });

  // 测试基础配置
  describe('Configuration', () => {
    test('should set base URL', () => {
      expect(httpClient.getBaseURL()).toBe('https://api.example.com');
    });

    test('should set headers', () => {
      expect(httpClient.getHeaders()).toEqual({ 'X-Custom-Header': 'test' });
    });

    test('should toggle rsql encoding', () => {
      httpClient.setEncodeRsql(false);
      expect(httpClient.getEncodeRsql()).toBe(false);
    });
  });

  const createMockApolloClient = () =>
    ({
      query: jest.fn().mockResolvedValue({ data: {} }),
      mutate: jest.fn().mockResolvedValue({ data: {} }),
      // 添加缓存方法模拟
      cache: {
        readQuery: jest.fn(),
        writeQuery: jest.fn()
      }
    } as unknown as ApolloClient<unknown>);

  describe('Request Building', () => {
    let mockApolloClient: ApolloClient<unknown>;

    beforeEach(() => {
      mockApolloClient = createMockApolloClient();
      // 使用更安全的类型断言
      jest.spyOn(httpClient as any, 'getClient').mockReturnValue(mockApolloClient);
    });

    test('commonQuery should build correct query', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({
          data: {
            TestModelQuery: {
              getData: 1
            }
          }
        }),
        mutate: jest.fn().mockResolvedValue({
          data: {}
        })
      };
      jest.spyOn(httpClient as any, 'getClient').mockReturnValue(mockClient);
      await httpClient.commonQuery({
        module: 'test',
        model: 'TestModel',
        method: 'getData',
        param: 'id: "123"',
        responseBody: '{ id name }'
      });

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.anything(),
          variables: expect.objectContaining({
            path: undefined
          }),
          context: {}
        })
      );

      // // 添加模块名称验证
      // expect((httpClient as any).getClient).toHaveBeenCalledWith('test');
    });

    test('commonMutate should build correct mutation', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({
          data: {}
        }),
        mutate: jest.fn().mockResolvedValue({
          data: {
            TestModelMutation: {
              updateData: 1
            }
          }
        })
      };
      jest.spyOn(httpClient as any, 'getClient').mockReturnValue(mockClient);
      await httpClient.commonMutate({
        module: 'test',
        model: 'TestModel',
        method: 'updateData',
        param: 'input: { id: "123" }',
        responseBody: '{ status }'
      });

      expect(mockClient.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          mutation: expect.anything(),
          variables: expect.objectContaining({
            path: undefined
          }),
          context: {}
        })
      );
    });
  });

  // 测试异常处理
  describe('Error Handling', () => {
    test('should throw error for empty module name', async () => {
      await expect(() => httpClient.query('', 'query {}')).toThrowError('Module name is undefined when query');
      await expect(() => httpClient.mutate('', 'mutation {}')).toThrowError('Module name is undefined when mutation');
    });
  });
});

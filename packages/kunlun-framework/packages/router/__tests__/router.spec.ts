/**
 * @jest-environment jsdom
 */
jest.mock('page', () => {
  const routerFn: any = (..._args: any[]) => {};
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => routerFn)
    }
  };
});

import { createRouter, getRouterInstance } from '../src/router';

describe('router 实例', () => {
  it('getRouterInstance 返回单例', () => {
    const r1 = getRouterInstance();
    const r2 = getRouterInstance();
    expect(r1).toBe(r2);
  });

  it('createRouter 每次创建新实例', () => {
    const r1 = createRouter();
    const r2 = createRouter();
    expect(r1).not.toBe(r2);
  });

  it('router 暴露基础导航 API', () => {
    const router = createRouter();
    expect(typeof router.ignite).toBe('function');
    expect(typeof router.navigate).toBe('function');
    expect(typeof router.push).toBe('function');
    expect(typeof router.back).toBe('function');
    expect(typeof router.activatedRoute.subscribe).toBe('function');
  });
});

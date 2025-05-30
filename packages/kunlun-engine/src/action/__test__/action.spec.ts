import { generatorViewActionQueryParameter } from '../helper';
import { ViewActionTarget } from '@kunlun/meta';
import { MultiTabsRuntimeManifestMergedConfigManager } from '../../view/multi-tabs/config-manager';
import { RuntimeViewAction, RuntimeServerAction } from '../../runtime-metadata';
import { ActionElement, IServerAction } from '@kunlun/meta';
import { executeServerAction, runServerAction } from '../implementation/server';

jest.mock('@kunlun/router', () => ({
  useMatched: () => ({
    matched: {
      segmentParams: {
        page: {
          module: 'mock_lasted_module'
        }
      }
    }
  })
}));

const callFunction = jest.fn();
jest.mock('@kunlun/service', () => ({
  ...jest.requireActual('@kunlun/service'),
  callFunction: (...arg) => callFunction(...arg)
}));

const mockHelper = jest.fn().mockResolvedValue(null);
jest.mock('../../helper', () => ({
  ...jest.requireActual('../../helper'),
  requestMutationByActionElement: (...args) => mockHelper(...args)
}));

describe('generatorViewActionQueryParameter tests', () => {
  it('should prioritize options.moduleName', () => {
    const action = {} as RuntimeViewAction;
    const options = { moduleName: 'custom_module' };
    const result = generatorViewActionQueryParameter(action, options);
    expect(result.module).toBe('custom_module');
  });

  it('should handle usingLastedModule=true', () => {
    const action = { resModuleName: undefined, moduleName: 'original' };
    const options = { usingLastedModule: true };
    const result = generatorViewActionQueryParameter(action as any, options);
    expect(result.module).toBe('mock_lasted_module');
  });

  it('should fallback to default module resolution', () => {
    const action = { moduleName: 'fallback' };
    const options = {};
    const result = generatorViewActionQueryParameter(action as any, options);
    expect(result.module).toBe('fallback');
  });

  it('should set target based on config manager', () => {
    jest.mock('../../view/multi-tabs/config-manager', () => ({
      MultiTabsRuntimeManifestMergedConfigManager: {
        isEnabled: jest.fn().mockReturnValue(true)
      }
    }));
    const action = { target: ViewActionTarget.SameWindow };
    const options = { moduleName: 'test' };
    const result = generatorViewActionQueryParameter(action as any, options);
    expect(result.target).toBe(ViewActionTarget.OpenWindow);
  });

  describe('参数边界情况', () => {
    it('空action应抛出错误', () => {
      expect(() => generatorViewActionQueryParameter(undefined as any)).toThrowError();
    });

    it('options为null时应使用默认逻辑', () => {
      const action = { moduleName: 'fallback' };
      const result = generatorViewActionQueryParameter(action as any, null);
      expect(result.module).toBe('fallback');
    });

    it('极端target配置测试', () => {
      MultiTabsRuntimeManifestMergedConfigManager.isEnabled = jest.fn().mockReturnValue(false);
      const action = { target: ViewActionTarget.NewTab };
      const result = generatorViewActionQueryParameter(action as any);
      expect(result.target).toBe(ViewActionTarget.NewTab);
    });
  });
});

const mockAction: RuntimeServerAction = {
  model: 'testModel',
  sessionPath: '/test/path'
  // 类型断言解决TS类型校验
} as unknown as RuntimeServerAction;

const mockActionElement: ActionElement = {
  id: 'action_123',
  type: 'mutation'
};

describe('executeServerAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 核心功能验证
  it('应正确调用callFunction并传递参数', async () => {
    const testParam = { key: 'value' };
    await executeServerAction(mockAction, testParam);

    expect(callFunction).toHaveBeenCalledWith(
      'testModel',
      expect.objectContaining({ model: 'testModel' }) as IServerAction,
      testParam,
      undefined,
      { path: '/test/path' },
      { maxDepth: 1 }
    );
  });
});

describe('runServerAction', () => {
  it('应正确传递actionElement参数', async () => {
    const testParam = { query: 'test' };
    await runServerAction(mockAction, mockActionElement, testParam);

    expect(mockHelper).toHaveBeenCalledWith(mockAction, mockActionElement, testParam, {
      maxDepth: 1
    });
  });
});

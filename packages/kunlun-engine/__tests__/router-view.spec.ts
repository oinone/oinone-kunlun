import { ViewActionTarget } from '@oinone/kunlun-meta';
import { executeViewAction } from '../src/action/implementation/view';
import { DefaultSingleStackRouter } from '../src/router/DefaultSingleStackRouter';

jest.mock('../src/view', () => {
  return {
    Dialog: {
      createByViewAction: jest.fn()
    },
    Drawer: {
      createByViewAction: jest.fn()
    }
  };
});

describe('DefaultSingleStackRouter', () => {
  it('push back and forward update browser history', () => {
    const router = new DefaultSingleStackRouter();
    const pushStateSpy = jest.spyOn(window.history, 'pushState').mockImplementation(() => undefined);
    const replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => undefined);

    router.push('/page1', true);
    router.push('/page2', true);

    expect(pushStateSpy).toHaveBeenCalledTimes(1);
    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/page2');

    router.back();
    expect(replaceStateSpy).toHaveBeenLastCalledWith(null, '', '/page1');

    router.forward();
    expect(replaceStateSpy).toHaveBeenLastCalledWith(null, '', '/page2');

    pushStateSpy.mockRestore();
    replaceStateSpy.mockRestore();
  });
});

describe('executeViewAction', () => {
  it('builds router parameters from action and extra', () => {
    const push = jest.fn();
    const router = { push } as any;
    const matched = {
      path: '/module/view',
      segmentParams: {
        page: {
          module: 'OldModule',
          viewType: 'Table',
          model: 'OldModel',
          action: 'oldAction'
        }
      }
    } as any;
    const action = {
      target: ViewActionTarget.Router,
      moduleName: 'NewModule',
      resModuleName: undefined,
      viewType: 'Form',
      resViewType: undefined,
      model: 'DemoModel',
      name: 'detail',
      sessionPath: '/session/path'
    } as any;

    executeViewAction(action, router, matched, { extraKey: 'extra', preserveParameter: false });

    expect(push).toHaveBeenCalledTimes(1);
    const [location, target] = push.mock.calls[0];
    expect(target).toBeUndefined();
    expect(location.segments).toHaveLength(1);
    const segment = location.segments[0];
    expect(segment.path).toBe('module/view');
    expect(segment.parameters.module).toBe('NewModule');
    expect(segment.parameters.viewType).toBe('Form');
    expect(segment.parameters.model).toBe('DemoModel');
    expect(segment.parameters.action).toBe('detail');
    expect(segment.parameters.scene).toBe('detail');
    expect(segment.parameters.target).toBe(ViewActionTarget.Router);
    expect(segment.parameters.extraKey).toBe('extra');
    expect(segment.parameters.path).toBe('/session/path');
    expect(segment.extra.preserveParameter).toBe(false);
  });
});

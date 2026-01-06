import { computed, createApp, defineComponent, h } from 'vue';
import { ViewType } from '@oinone/kunlun-meta';
import { useProviderMetaContext, useInjectMetaContext, defaultMetaContext } from '../context';
import { clearViewState, createViewState, getViewState, setViewState } from '../view';
import { globalState } from '../global';
import { useOioState } from '../use-state';
import { createActionBarState, getActionBarState, popAction, pushAction } from '../method/action';
import { popField, pushField } from '../method/field';

describe('state/context', () => {
  it('useProviderMetaContext/ useInjectMetaContext 应合并默认值和传入状态', () => {
    let ctx: ReturnType<typeof useInjectMetaContext> | undefined;

    const App = defineComponent({
      setup() {
        useProviderMetaContext({});
        return () =>
          h(
            defineComponent({
              setup() {
                ctx = useInjectMetaContext();
                return () => null;
              }
            })
          );
      }
    });

    const app = createApp(App);
    const container = document.createElement('div');
    app.mount(container);

    expect(ctx).toBeDefined();
    expect(ctx!.viewType.value).toBe(defaultMetaContext.viewType.value);
    expect(ctx!.model.value).toBe(defaultMetaContext.model.value);

    app.unmount();
  });
});

describe('state/view & use-state', () => {
  it('createViewState/ setViewState/ getViewState/ clearViewState 应维护视图状态', () => {
    const handle = 'view-handle';
    const state = createViewState(handle);
    expect(state.handle).toBe(handle);

    setViewState(state);
    expect(getViewState(handle)).toBe(state);

    const cleared = clearViewState(handle);
    expect(cleared).toBe(state);
    expect(getViewState(handle)).toBeUndefined();
  });

  it('useOioState 不带 handle 时返回全局状态和当前 viewState 方法', () => {
    const handle = 'view-handle-2';
    const state = createViewState(handle);
    setViewState(state);

    const result = useOioState();
    expect(result.globalState).toBe(globalState);
    expect(result.viewState).toBeUndefined();
    expect(typeof result.createViewState).toBe('function');
  });

  it('useOioState 带 handle 时返回该视图的快捷操作函数', () => {
    const handle = 'view-handle-3';
    const state = createViewState(handle);
    setViewState(state);

    const result = useOioState(handle);
    expect(result.globalState).toBe(globalState);
    expect(result.viewState).toBe(state);

    const newState = result.createViewState();
    expect(newState.handle).toBe(handle);
    expect(result.getViewState()).toBe(newState);

    const removed = result.clearViewState();
    expect(removed).toBe(newState);
    expect(result.getViewState()).toBeUndefined();
  });
});

describe('state/method/action', () => {
  it('createActionBarState/getActionBarState/pushAction/popAction 应正确维护动作条', () => {
    const viewState = createViewState('action-view');
    const actionBar = createActionBarState.call(viewState, { handle: 'action-view' });
    (viewState as any).actionBar = actionBar;

    const currentActionBar = getActionBarState.call(viewState);
    expect(currentActionBar).toBe(actionBar);

    pushAction.call(viewState, 'action1');
    expect(actionBar.actions).toContain('action1');

    popAction.call(viewState, 'action1');
    expect(actionBar.actions).not.toContain('action1');
  });
});

describe('state/method/field', () => {
  it('pushField/popField 应维护字段集合', () => {
    const viewState = createViewState('field-view');
    (viewState as any).fields = [];
    (viewState as any).viewType = ViewType.Table;

    pushField.call(viewState, 'field1');
    expect(viewState.fields).toContain('field1');

    popField.call(viewState, 'field1');
    expect(viewState.fields).not.toContain('field1');
  });
});

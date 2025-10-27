import { reactive } from 'vue';
import { useInjectMetaContext } from './context';
import { popAction, popField, pushAction, pushField } from './method';
import { OioAnyViewState } from './typing';

const viewStateStorage: Record<string, OioAnyViewState> = {};

const viewStateMethods: Record<string, Function> = {
  pushField,
  popField,
  pushAction,
  popAction
};

export function createViewState(handle: string): OioAnyViewState {
  const state = {
    get handle() {
      return handle;
    },
    fullscreen: false
  } as OioAnyViewState;
  const proxy = reactive<OioAnyViewState>(state);
  for (const [method, fn] of Object.entries(viewStateMethods)) {
    state[method] = fn.bind(proxy);
  }
  return proxy;
}

export function getViewState(handle?: string): OioAnyViewState | undefined {
  if (!handle) {
    handle = useInjectMetaContext()?.rootHandle.value;
    if (!handle) {
      console.warn('Invalid root handle.');
      return undefined;
    }
  }
  return viewStateStorage[handle];
}

export function setViewState(state: OioAnyViewState): void {
  viewStateStorage[state.handle] = state;
}

export function clearViewState(handle?: string): OioAnyViewState | undefined {
  if (!handle) {
    handle = useInjectMetaContext()?.rootHandle.value;
    if (!handle) {
      console.warn('Invalid root handle.');
      return undefined;
    }
  }
  const state = viewStateStorage[handle];
  delete viewStateStorage[handle];
  return state;
}

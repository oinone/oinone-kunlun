import { reactive } from 'vue';
import { type OioAnyViewState, OioGlobalState } from './typing';
import { getViewState } from './view';

const globalStateMethods: Record<string, Function> = {
  getMainViewState
};

function createGlobalState(): OioGlobalState {
  const state = {
    fullscreen: false
  } as OioGlobalState;
  const proxy = reactive<OioGlobalState>(state);
  for (const [method, fn] of Object.entries(globalStateMethods)) {
    state[method] = fn.bind(proxy);
  }
  return proxy;
}

export function getMainViewState(this: OioGlobalState): OioAnyViewState | undefined {
  return getViewState(this.mainViewHandle);
}

export const globalState = createGlobalState();

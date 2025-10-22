import { reactive } from 'vue';
import { useInjectMetaContext } from '../context';
import { OioAnyViewState } from './typing';

const viewStateStorage: Record<string, OioAnyViewState> = {};

export function createViewState(handle: string): OioAnyViewState {
  return reactive<OioAnyViewState>({
    get handle() {
      return handle;
    },
    fullscreen: false
  } as OioAnyViewState);
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

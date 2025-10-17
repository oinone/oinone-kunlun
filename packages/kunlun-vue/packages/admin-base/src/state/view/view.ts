import { reactive } from 'vue';
import { useInjectMetaContext } from '../../tags/context';
import { OioViewState } from './typing';

const viewStateStorage: Record<string, OioViewState> = {};

export function createViewState(handle: string): OioViewState {
  const storage = reactive<OioViewState>({
    handle,
    fullscreen: false
  });
  return {
    get handle() {
      return storage.handle;
    },
    get fullscreen() {
      return storage.fullscreen;
    },
    set fullscreen(value: boolean) {
      storage.fullscreen = value;
    }
  };
}

export function getViewState(handle?: string): OioViewState | undefined {
  if (!handle) {
    handle = useInjectMetaContext()?.rootHandle.value;
    if (!handle) {
      console.warn('Invalid root handle.');
      return undefined;
    }
  }
  return viewStateStorage[handle];
}

export function setViewState(state: OioViewState): void {
  viewStateStorage[state.handle] = state;
}

export function clearViewState(handle?: string): OioViewState | undefined {
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

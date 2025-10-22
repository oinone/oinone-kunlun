import { globalState, OioGlobalState } from './global';
import { clearViewState, createViewState, getViewState, OioAnyViewState, setViewState } from './view';

export function useOioState(): {
  globalState: OioGlobalState;
  viewState: OioAnyViewState | undefined;

  createViewState: (handle: string) => OioAnyViewState;
  getViewState: (handle: string) => OioAnyViewState | undefined;
  clearViewState: (handle: string) => OioAnyViewState | undefined;
};

export function useOioState(handle: string): {
  globalState: OioGlobalState;
  viewState: OioAnyViewState | undefined;

  createViewState: () => OioAnyViewState;
  getViewState: () => OioAnyViewState | undefined;
  clearViewState: () => OioAnyViewState | undefined;
};

export function useOioState(handle?: string) {
  if (handle) {
    return {
      globalState,
      viewState: getViewState(handle),
      createViewState: () => {
        const state = createViewState(handle);
        setViewState(state);
        return state;
      },
      getViewState: () => getViewState(handle),
      clearViewState: () => clearViewState(handle)
    };
  }
  return {
    globalState,
    viewState: getViewState(),
    createViewState,
    getViewState,
    clearViewState
  };
}

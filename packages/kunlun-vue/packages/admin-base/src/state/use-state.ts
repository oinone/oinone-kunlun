import { globalState, OioGlobalState } from './global';
import { clearViewState, createViewState, getViewState, OioViewState, setViewState } from './view';

export function useOioState(): {
  globalState: OioGlobalState;
  viewState: OioViewState | undefined;

  createViewState: (handle: string) => OioViewState;
  getViewState: (handle: string) => OioViewState | undefined;
  clearViewState: (handle: string) => OioViewState | undefined;
};

export function useOioState(handle: string): {
  globalState: OioGlobalState;
  viewState: OioViewState | undefined;

  createViewState: () => OioViewState;
  getViewState: () => OioViewState | undefined;
  clearViewState: () => OioViewState | undefined;
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

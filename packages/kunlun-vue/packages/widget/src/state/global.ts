import { reactive } from 'vue';

export interface OioGlobalState {
  fullscreen: boolean;
}

function createGlobalState(): OioGlobalState {
  return reactive<OioGlobalState>({
    fullscreen: false
  });
}

export const globalState = createGlobalState();

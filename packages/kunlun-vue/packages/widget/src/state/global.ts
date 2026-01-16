import { reactive } from 'vue';
import { OioGlobalState } from './typing';

function createGlobalState(): OioGlobalState {
  return reactive<OioGlobalState>({
    fullscreen: false
  });
}

export const globalState = createGlobalState();

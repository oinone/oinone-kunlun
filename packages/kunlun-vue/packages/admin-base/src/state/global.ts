import { reactive } from 'vue';

export interface OioGlobalState {
  fullscreen: boolean;
}

function createGlobalState(): OioGlobalState {
  const storage = reactive<OioGlobalState>({
    fullscreen: false
  });
  return {
    get fullscreen() {
      return storage.fullscreen;
    },
    set fullscreen(value: boolean) {
      storage.fullscreen = value;
    }
  };
}

export const globalState = createGlobalState();

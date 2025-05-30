import { reactive } from 'vue';

interface IStore {
  nodeType: 'MENU' | 'MODULE' | 'HOMEPAGE' | '';
  selectedTreeItem: Record<string, any>;
  enableMulti: boolean;
  loading: boolean;
  reset: () => void;
}

const state = reactive<IStore>({
  loading: false,
  nodeType: '',
  enableMulti: false,
  selectedTreeItem: {},
  reset() {
    state.loading = false;
    state.nodeType = '';
    state.enableMulti = false;
    state.selectedTreeItem = {};
  }
});

export const useStore = () => {
  return state;
};

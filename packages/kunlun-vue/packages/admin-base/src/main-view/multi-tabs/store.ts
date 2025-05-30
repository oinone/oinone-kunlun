import { ref, Ref } from 'vue';

export interface KeepAliveStore {
  store: Ref<string[]>;

  add(name: string): boolean;

  remove(name: string): boolean;

  clear(): void;
}

export function useMultiTabKeepAliveStore(): KeepAliveStore {
  const store = ref<string[]>([]);

  const add = (name: string): boolean => {
    if (!store.value.includes(name)) {
      store.value = [...store.value, name];
      return true;
    }
    return false;
  };

  const remove = (name: string): boolean => {
    const index = store.value.findIndex((v) => v === name);
    if (index === -1) {
      return false;
    }
    store.value.splice(index, 1);
    store.value = [...store.value];
    return true;
  };

  const clear = () => {
    store.value = [];
  };

  return {
    store,

    add,
    remove,
    clear
  };
}

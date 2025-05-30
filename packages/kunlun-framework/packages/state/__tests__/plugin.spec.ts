import { defineOioStore } from '../src/index';

const myPlugin = () => {
  return {
    pluginAttr: 'attr'
  };
};

describe('plugin', () => {
  const useStore = defineOioStore({
    state: () => ({}),
    plugins: [myPlugin]
  });

  const store = useStore();

  it('plugin return object', () => {
    expect(store._p).not.toBeUndefined();
    expect(store._p).not.toBeNull();

    expect(store._p?.length).toBe(1);
    expect(store._customProperties).toBeInstanceOf(Set);
  });
});

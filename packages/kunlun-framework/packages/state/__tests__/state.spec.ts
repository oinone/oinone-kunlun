import { defineOioStore } from '../src/index';

describe('state', () => {
  const useStore = defineOioStore({
    state: () => ({
      name: 'stateName',
      age: 18
    }),
    actions: {
      setName(newName: string) {
        this.context.name = newName;
      },
      setAge(age: number) {
        this.context.age = age;
      }
    }
  });

  const store = useStore();

  it('Judge the value of state initialization', () => {
    expect(store.name).toBe('stateName');
    expect(store.age).toBe(18);
    expect(store._state).toMatchObject({
      name: 'stateName',
      age: 18
    });
  });

  it('update state', () => {
    store.setName('newName');
    store.setAge(20);
    expect(store.name).toBe('newName');
    expect(store.age).toBe(20);

    store.reset();

    expect(store._state).toEqual({
      name: 'stateName',
      age: 18
    });
  });
});

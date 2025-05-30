import { defineOioStore } from '../src/index';

describe('watch', () => {
  const useStore = defineOioStore({
    state: () => ({
      name: 'watchState',
      info: {}
    }),
    actions: {
      setName(newName: string) {
        this.context.name = newName;
      },
      setInfo(info: Record<string, any>) {
        this.context.info = info;
      }
    }
  });

  const store = useStore();

  test('action can be watched', () => {
    const fn = jest.fn();
    let _action;

    store.subscribeAction((action) => {
      fn();
      _action = action;
    });

    store.setName('new state');
    expect(fn).toHaveBeenCalled();
    expect(_action).toEqual({ type: 'setName', payload: ['new state'] });

    store.setInfo({ subInfo: 'test' });
    expect(fn).toHaveBeenCalled();
    expect(_action).toEqual({ type: 'setInfo', payload: [{ subInfo: 'test' }] });

    expect(store.info).toEqual({ subInfo: 'test' });

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

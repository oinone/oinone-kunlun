import { StateStream } from './state-stream';
import { ActionsTree, GettersTree, Options, StateTree, StoreDefinition, StoreWithGetters, SubAction } from './typing';

const isPlainObject = (v) => {
  return Object.prototype.toString.call(v) === '[object Object]';
};

const emptyOptions = Object.create({}) as Options;
const DEFAULT_ID = '__OIO_ID__';

const _oioStoreMap = new Map<string, () => StoreDefinition>();

/**
 * @param option store的option
 *
 * @example
 *
 * const useStore = defineOioStore({
 *  id: 'storeId',
 *  state: {
 *    userName: '张三',
 *    age: 18
 *  },
 * })
 */
export function defineOioStore<
  Id extends string,
  S extends StateTree = () => {},
  G extends GettersTree<S> = {},
  A extends ActionsTree = {}
>(option: Options<Id, S, G, A>): () => StoreDefinition<Id, S, G, A>;

/**
 * @param id store的唯一标识 (必填)
 * @param option store的option
 *
 * @example
 *
 * const useStore = defineOioStore('store-id', {
 *  state: {
 *    userName: '张三',
 *    age: 18
 *  },
 * })
 */
export function defineOioStore<
  Id extends string,
  S extends StateTree = () => {},
  G extends GettersTree<S> = {},
  A extends ActionsTree = {}
>(id: Id, option: Omit<Options<Id, S, G, A>, 'id'>): () => StoreDefinition<Id, S, G, A>;

export function defineOioStore<
  Id extends string,
  S extends StateTree = () => {},
  G extends GettersTree<S> = {},
  A extends ActionsTree = {}
>(idOrOptions: Options | string, setupOptions?: Options): () => StoreDefinition<Id, S, G, A> {
  let id: string;
  let options: Options;

  if (typeof idOrOptions === 'string') {
    id = idOrOptions;
    options = setupOptions || emptyOptions;
  } else {
    options = idOrOptions;
    id = idOrOptions.id || DEFAULT_ID;
  }

  let context: StoreDefinition<Id, S, G, A>;

  let proxyContext;

  const stream$ = new StateStream({});

  function useOioStore(): StoreDefinition<Id, S, G, A> {
    // 存储初始化的数据
    let initialValue;
    let currentState = {};
    if (typeof options.state === 'function') {
      currentState = options.state();

      initialValue = JSON.parse(JSON.stringify(isPlainObject(currentState) ? currentState : {}));
    }

    stream$.initValue(currentState);

    const actions = options.actions || {};
    const plugins = options.plugins || [];
    const getters = options.getters || {};

    const __actions = {};

    const _subscribeAction: Array<(action: SubAction, nextState: ReturnType<S>) => void> = [];

    /**
     * 遍历action
     *  1. 先获取原来的action
     *  2. 重写修改action执行逻辑
     */
    Reflect.ownKeys(actions).forEach((key) => {
      if (typeof key === 'string') {
        const fn = actions[key];
        __actions[key] = (...arg: any[]) => {
          const result = fn.call(
            {
              context: proxyContext
            },
            ...arg
          );

          _subscribeAction.forEach((handler) =>
            handler(
              {
                type: key,
                payload: arg
              },
              stream$.getContext() as ReturnType<S>
            )
          );

          return result;
        };
      }
    });

    // 销毁事件监听
    const dispose = () => {
      stream$.unsubscribe();
      _oioStoreMap.set(id, null as any);
    };

    // 重置 store 的值
    const reset = (state?: any) => {
      const value = state || initialValue;
      stream$.initValue(value);
      initialValue = value;
    };

    // 分发 action
    const dispatch = (actionName: string, ...arg: any[]) => {
      const action = __actions.hasOwnProperty(actionName);

      if (action) {
        __actions[actionName].call(
          {
            context: proxyContext
          },
          ...arg
        );
      }

      return proxyContext;
    };

    // 监听 store 中的state
    function watch(handler: (val: ReturnType<S> & StoreWithGetters<G>) => void) {
      stream$.subscribe((v) => {
        const _g = {};

        Object.keys(getters).forEach((k) => {
          _g[k] = proxyContext[k];
        });

        handler({ ...v, ..._g } as any);
      });
    }

    // 订阅 action 的分发
    function subscribeAction(handler: (action: SubAction, nextState: ReturnType<S>) => void) {
      _subscribeAction.push(handler);
    }

    const _customProperties = new Set<Record<string, unknown>>();

    context = {
      ...(stream$.getContext() as ReturnType<S>),
      ...(__actions as A),
      ...getters,

      get _state() {
        return stream$.getContext() as Readonly<ReturnType<S>>;
      },
      get _initState() {
        return initialValue;
      },

      _actions: __actions as A,
      _p: plugins,
      _customProperties,
      id: id as Id,

      dispose,
      reset,
      dispatch,
      watch,
      subscribeAction
    };

    // 冻结的属性
    const freezeProperties = [
      '_state',
      '_initState',
      '_actions',
      '_p',
      '_customProperties',
      'id',
      'dispose',
      'reset',
      'dispatch',
      'watch',
      'subscribeAction'
    ];

    const isFreezeProperty = (key) => {
      return (typeof key === 'string' && freezeProperties.includes(key)) || __actions[key];
    };

    function toProxy(target: Record<string, unknown> | unknown[]) {
      return new Proxy(target, {
        get(target, key, receiver) {
          const res = Reflect.get(target, key, receiver);
          if (!isFreezeProperty(key) && (isPlainObject(res) || Array.isArray(res))) {
            return toProxy(res);
          }

          return res;
        },
        set(target, key, value, receiver) {
          if (isFreezeProperty(key)) {
            return false;
          }

          const result = Reflect.set(target, key, value, receiver);

          const resetValue = {};
          Object.keys(currentState).forEach((k) => {
            resetValue[k] = proxyContext[k];
          });

          stream$.initValue(resetValue);

          return result;
        }
      });
    }

    proxyContext = toProxy(context);

    // 对 getters 做数据劫持，不允许被修改
    Reflect.ownKeys(getters).forEach((key) => {
      if (typeof key === 'string') {
        Reflect.defineProperty(proxyContext, key, {
          get() {
            return getters[key](stream$.getContext());
          }
        });
      }
    });

    plugins.forEach((extender) => {
      if (typeof extender === 'function') {
        const extendRes = extender(proxyContext);

        if (extendRes && isPlainObject(extendRes)) {
          _customProperties.add(extendRes);
          stream$.setValues(extendRes);
        }
      }
    });

    return proxyContext;
  }

  useOioStore.$id = id;

  _oioStoreMap.set(id, useOioStore);

  return useOioStore;
}

/**
 * 根据 id 获取 相对应的store
 *
 * @param {string} id store 中的id
 */
export function getOioStore(id: string): (() => StoreDefinition) | null {
  const _id = id || DEFAULT_ID;

  if (_oioStoreMap.has(_id)) {
    const res = _oioStoreMap.get(_id)!;
    return res;
  }

  return null;
}

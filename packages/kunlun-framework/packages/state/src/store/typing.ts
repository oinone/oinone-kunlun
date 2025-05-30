export type ActionThis<Ctx, Other> = {
  context: Ctx & Other;
};

export type StateTree = () => {
  readonly [x: string]: any;
  readonly [x: number]: any;
  readonly [x: symbol]: any;
};

export type GettersTree<S extends StateTree> = {
  readonly [key: string]: ((state: Readonly<ReturnType<S>>) => any) | (() => any);
};

export type StoreWithGetters<G> = {
  readonly [k in keyof G]: G[k] extends (...args: any[]) => infer R ? R : G[k];
};

export type ActionsTree = {
  [x: string]: (...arg: any[]) => void | unknown;
};

export interface Options<
  Id extends string = string,
  S extends StateTree = StateTree,
  G extends GettersTree<S> = GettersTree<S>,
  A extends ActionsTree = ActionsTree
> {
  id?: Id;
  state: S;
  getters?: G & GettersTree<S>;
  actions?: A & ThisType<ActionThis<StoreDefinition<Id, S, GettersTree<S>, A>, StoreWithGetters<G>>>;
  plugins?: StorePlugin[];
}

export type StoreDefinition<
  Id extends string = string,
  S extends StateTree = StateTree,
  G extends GettersTree<S> = GettersTree<S>,
  A extends ActionsTree = ActionsTree
> = Store<Id, S, G, A>;

export type Store<
  Id extends string = string,
  S extends StateTree = () => {},
  G extends GettersTree<S> = {},
  A extends ActionsTree = {}
> = {
  /**
   * 销毁 store 与 store 上的事件监听
   */
  dispose(): void;

  /**
   * 重置 store 的初始化数据
   */
  reset(state?: any): void;

  /**
   * 分发对应的 action
   *
   * @param {string} name action name
   * @param arg action的参数
   *
   * @example
   *
   * store.dispatch('actionName', {payload: 'new value'})
   */
  dispatch(name: keyof A, ...arg: any[]): StoreDefinition<Id, S, G, A>;

  /**
   * 监听 store 的数据变化, 会再 state 发生变化后执行
   *
   * @param {function} handler 回调函数
   *
   * @example
   *
   * store.watch(newState => { // newState包含了 store 中的 state 跟 getters
   *  ...todo
   * })
   */
  watch: (handler: (value: ReturnType<S> & StoreWithGetters<G>) => void) => void;

  /**
   * 订阅 store 的 action。handler 会在每个 action 分发的时候调用并接收
   *  handler 能获得当前执行的 action  与最新的 state, action中包含 type 跟 payload
   *                          type -> 当前执行的action
   *                          payload action中接受的参数，如果没有则是undefined
   *
   * @param {function} handler
   *
   * @example
   *
   * store.subscribeAction((action, newState) => {
   *  console.log(action.type)
   *  console.log(action.payload)
   *  console.log(newState)
   * })
   *
   */
  subscribeAction: (handler: (action: SubAction, nextState: ReturnType<S>) => void) => void;

  /**
   * 自定义插件
   */
  _p?: StorePlugin[];

  /**
   * 插件中返回的数据集合
   */
  _customProperties: Set<Record<string, unknown>>;
  id?: Id;
  readonly _state: Readonly<ReturnType<S>>;
  readonly _initState: Readonly<ReturnType<S>>;
  readonly _actions: A;
  [key: string]: any;
} & ReturnType<S> &
  StoreWithGetters<G> &
  A;

export interface StorePlugin {
  (context: StoreDefinition): void | Record<string, any>;
}

export type SubAction = { type: string; payload: unknown | undefined };

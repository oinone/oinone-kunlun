import { genStaticPath, translateValueByKey, WidgetConstructor, WidgetProps } from '@oinone/kunlun-engine';
import { ReturnPromise, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { ComponentPublicInstance, SetupContext } from '@vue/runtime-core';
import {
  Component,
  ComponentOptions,
  computed,
  createVNode,
  defineComponent,
  DefineComponent,
  EffectScope,
  effectScope,
  isRef,
  nextTick,
  ref,
  Ref,
  Slot,
  Slots,
  toRaw,
  VNode,
  watch
} from 'vue';
import VueFragment from './VueFragment.vue';
import { Widget } from './Widget';

enum BehaviorName {
  'beforeCreated' = 'beforeCreated',
  'created' = 'created',
  'beforeMount' = 'beforeMount',
  'mounted' = 'mounted',
  'beforeUpdate' = 'beforeUpdate',
  'updated' = 'updated',
  'activated' = 'activated',
  'deactivated' = 'deactivated',
  'beforeUnmount' = 'beforeUnmount',
  'unmounted' = 'unmounted'
}

export type WidgetComponent = string | ComponentOptions | DefineComponent | Component | Record<string, unknown>;

export type SetupHook =
  | ((ctx?: void, props?: unknown, result?: unknown) => void)
  | ((ctx?: void, props?: unknown, result?: unknown) => unknown)
  | ((ctx?: void, props?: unknown, result?: unknown) => Promise<void>)
  | ((ctx?: void, props?: unknown, result?: unknown) => Promise<unknown>);

export class VueWidget<Props extends WidgetProps = WidgetProps> extends Widget<Props, VNode | VNode[]> {
  protected behaviorGroup = {};

  private __render__?: (...args: unknown[]) => VNode | null;

  private static beforeHooks: Map<
    string,
    Map<string, ((next: (args: unknown[]) => void, ...args: unknown[]) => boolean | undefined)[]>
  > = new Map();

  private static afterHooks: Map<
    string,
    Map<string, ((next: (result: unknown) => void, ...args: unknown[]) => boolean | undefined)[]>
  > = new Map();

  private static hookHosts: Map<Function, string[]> = new Map();

  /**
   * 通过该属性可以直接拿到Widget下Component内的属性
   * @private
   */
  private opt?: VueWidget;

  /**
   * vue实例内属性（props、computed、data）的集合
   */
  private res?: {};

  public revolveNodeCode() {
    return uniqueKeyGenerator();
  }

  private __scope!: EffectScope | null;

  /**
   * vue组件setup
   * @param setupHook
   */
  public setup(setupHook?: SetupHook) {
    return (ctx: void, props?: unknown) => {
      if (this.__scope) {
        this.__scope.stop();
        this.__scope = null;
      }

      this.__scope = effectScope();
      let result = {};

      this.__scope.run(() => {
        const { opt } = this;
        const attrs = this.getAttributes();
        attrs.forEach((nativeName, displayName) => {
          const compute = this.getComputeHandler(displayName);
          if (compute) {
            if (compute.get) {
              if (!compute.set) {
                Reflect.set(result, displayName, computed(compute.get!.bind(opt)));
              } else {
                Reflect.set(
                  result,
                  displayName,
                  computed({
                    get: compute.get!.bind(opt),
                    set: compute.set!.bind(opt)
                  })
                );
              }
            }
          } else {
            const raw = Reflect.get(this, nativeName);
            if (typeof raw === 'function') {
              Reflect.set(result, displayName, raw.bind(opt));
            } else if (typeof raw === 'object' && raw) {
              Reflect.set(result, displayName, ref(raw));
            } else {
              Reflect.set(result, displayName, ref(raw));
            }
          }
        });

        const watchers = this.getWatchers();
        watchers.forEach((watcher) => {
          const path = watcher.path.split('.');
          const val = result[path[0]];
          if (val) {
            if (path.length === 1) {
              /**
               *如果当前要监听的值是个Object类型，那么监听的newValue跟oldValue是相等的
               *
               * @see {@link https://cn.vuejs.org/v2/api/#vm-watch}
               */
              watch(val, watcher.handler.bind(opt), watcher.options);
            } else {
              watch(
                () => {
                  let tmp = val.value || {};
                  for (let index = 1; index < path.length; index++) {
                    tmp = tmp[path[index]];
                    if (!tmp) {
                      break;
                    }
                  }
                  return tmp;
                },
                watcher.handler.bind(opt),
                watcher.options
              );
            }
          }
        });
        const returnResult = setupHook && (setupHook(ctx, props, result) as Record<string, unknown>);
        returnResult && (result = { ...result, ...returnResult });
        this.res = result;
      });

      return result;
    };
  }

  /**
   * 标记一个方法为可被钩子注入，注解使用
   * @constructor
   * @protected
   */
  protected static HookHost() {
    return <T extends Widget>(target: T, name: string) => {
      const hosts: string[] = VueWidget.hookHosts.get(target.constructor) || [];
      hosts.push(name);
      VueWidget.hookHosts.set(target.constructor, hosts);
    };
  }

  /**
   * 获得组件中注册的所有钩子
   * @param widget
   * @private
   */
  private static getHookHosts(widget: Widget) {
    const results: string[] = [];

    /**
     * 获得对象的继承链
     * 0: ColorPickWidget()
     * 1: FormFieldWidget()
     * 2: FieldWidget()
     * 3: DslNodeWidget()
     * 4: VueWidget()
     * 5: Widget()
     */
    const getProtoChains = (): Function[] => {
      const chains: Function[] = [];
      let obj = widget.constructor;
      let { name } = obj;
      while (name !== '') {
        name = obj.name;
        chains.push(obj);
        obj = Object.getPrototypeOf(obj);
      }
      return chains;
    };
    const chains = getProtoChains();
    chains.forEach((c) => {
      const hosts = VueWidget.hookHosts.get(c);
      hosts && hosts.forEach((r) => results.push(r));
    });
    return results;
  }

  /**
   * 获得指定组件内方法的前/后置钩子
   * @param widgetName
   * @param hook
   * @param beforeOrAfter
   * @private
   */
  private static getHooks(widgetName: string, hook: string, beforeOrAfter: 'before' | 'after') {
    const widget = Widget.select(widgetName)!;
    const getProtoChains = <T extends Function>(obj: T) => {
      const result: string[] = [];
      let iterator = obj;
      while (iterator.name !== '') {
        result.push(iterator.name);
        iterator = Object.getPrototypeOf(iterator);
      }
      return result;
    };
    const chains = getProtoChains(widget.constructor);
    const hooks: ((
      next: (...args: unknown[]) => void,
      ...args: unknown[]
    ) => boolean | undefined | Promise<boolean> | Promise<void>)[] = [];
    chains.forEach((c) => {
      let tahooks: Map<
        string,
        ((
          next: (...args: unknown[]) => void,
          ...args: unknown[]
        ) => boolean | undefined | Promise<boolean> | Promise<void>)[]
      >;
      if (beforeOrAfter === 'after') {
        tahooks = VueWidget.afterHooks.get(c)!;
      } else {
        tahooks = VueWidget.beforeHooks.get(c)!;
      }
      const thooks = (tahooks && tahooks.get(hook)) || [];
      thooks.forEach((hookHandle) => hooks.push(hookHandle));
    });
    return hooks;
  }

  /**
   * 标记一个方法为后置钩子
   * @param host
   * @constructor
   * @protected
   */
  protected static BeforeHook(host: string) {
    return <T extends Widget>(
      target: T,
      _name: string,
      description: TypedPropertyDescriptor<() => boolean> | TypedPropertyDescriptor<() => void>
    ) => {
      const afterHosts = VueWidget.beforeHooks.get(target.constructor.name) || new Map();
      const afterHooks = afterHosts.get(host) || [];
      afterHooks.push(description.value!);
      afterHosts.set(host, afterHooks);
      VueWidget.beforeHooks.set(target.constructor.name, afterHosts);
    };
  }

  /**
   * 标记一个方法为前置钩子
   * @param host
   * @constructor
   * @protected
   */
  protected static AfterHook(host: string) {
    return <T extends Widget>(
      target: T,
      _name: string,
      description:
        | TypedPropertyDescriptor<(next: never, ...args: unknown[]) => boolean>
        | TypedPropertyDescriptor<(next: unknown, ...args: unknown[]) => void>
    ) => {
      const afterHosts = VueWidget.afterHooks.get(target.constructor.name) || new Map();
      const afterHooks = afterHosts.get(host) || [];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      afterHooks.push(description.value!);
      afterHosts.set(host, afterHooks);
      VueWidget.afterHooks.set(target.constructor.name, afterHosts);
    };
  }

  private component!: WidgetComponent;

  @Widget.Reactive()
  private node_code: string = this.revolveNodeCode();

  public getNodeCode(): string {
    return this.node_code;
  }

  public getNodeCodeRef(): Ref<number> {
    return (this.res! as { node_code: Ref<number> }).node_code;
  }

  /**
   * 获取当前组件的响应式对象
   */
  public getOperator<T extends VueWidget>(): T {
    const { opt } = this;
    if (!opt) {
      return this as unknown as T;
      // throw new Error(`error: operator lost :${this.getWidgetType()}:${this.getHandle()}`);
    }
    return opt as T;
  }

  /**
   * 在当前组件节点下创建子节点
   * @param constructor widget
   * @param slotName slotName
   * @param initConfig widget中initialize函数接受的参数
   * @param specifiedIndex 指定该widget的在父节点中的位置，默认是最后一位
   * @param resolveNewCode 是否更新node_code
   */
  public createWidget<T extends Widget>(
    constructor: WidgetConstructor<T['config'], T>,
    slotName?: string,
    initConfig?: T['config'],
    specifiedIndex?: number,
    resolveNewCode = false
  ): T {
    const opt = this.getOperator();
    const widget: T = super.createWidget.bind(opt)<T>(
      constructor,
      slotName,
      initConfig || ({} as T['config']),
      specifiedIndex
    );
    // 不要改，兼容执行视图和mask重新渲染 拿掉if mask的重绘失效了
    if (resolveNewCode) {
      opt.node_code = this.revolveNodeCode();
    }
    const instance = widget && widget.getOperator();
    if (specifiedIndex !== undefined && specifiedIndex >= 0) {
      this.getChildrenInstance()[specifiedIndex] = widget.getOperator();
    } else {
      // fixme: widget可能为空
      this.addChildrenInstance(instance);
    }
    return instance as unknown as T;
  }

  /**
   * 在当前组件节点下删除子节点树
   * @param name
   */
  public deleteWidget(name: string) {
    const result = super.deleteWidget(name);
    const opt = this.getOperator();
    opt.node_code = this.revolveNodeCode();

    return result;
  }

  /**
   * 给指定的下标插入widget
   *
   * 如果要在最后一位插入，可以用createWidget
   *
   * @param  {Widget} widget
   * @param  {number} index
   */
  public insertWidget(widget: Widget, index: number) {
    super.insertWidget(widget, index);
    const opt = this.getOperator();
    opt.node_code = this.revolveNodeCode();
  }

  /**
   * 移动widget, 将widget从 A 下标移动到 B 下标
   *
   * @param  {number} index1
   * @param  {number} index2
   */
  public moveChildWidget(index1: number, index2: number) {
    super.moveChildWidget(index1, index2);
    const opt = this.getOperator();
    opt.node_code = this.revolveNodeCode();
  }

  /**
   * 根据下标删除对应的child widget, 如果当前 children中有重复的handler，那么会删除匹配的第一个
   *
   * @param  {number} index
   * @param  {string} handle?
   */
  public deleteWidgetByIndex(index: number, handle?: string) {
    const result = super.deleteWidgetByIndex(index, handle);
    const opt = this.getOperator();
    opt.node_code = this.revolveNodeCode();

    return result;
  }

  /**
   * 初始化当前组件
   * @param props
   */
  public initialize(props: Props = {} as Props): VueWidget {
    super.initialize(props);
    this.component = VueFragment;
    this.buildOperator();
    /* IFDEBUG */
    // console.debug(`${this.getWidgetType()}:initialize`);
    /* FIDEBUG */
    return this;
  }

  private buildOperator(): VueWidget {
    const operator = new Proxy(this, {
      get: (target, key: string | symbol) => {
        if (key === 'isProxy') {
          return true;
        }
        if (key === 'constructor') {
          return this.constructor;
        }
        const result = this.res || {};
        const res = Reflect.get(result, key);
        if (res) {
          if (isRef(res)) {
            if (typeof res.value === 'object') {
              return res.value;
            }
            return res.value;
          }
          return res;
        }
        return Reflect.get(target, key);
      },
      set: (target, key: string | symbol, value: unknown) => {
        const result = this.res || {};
        const res = Reflect.get(result, key);
        if (typeof res === 'function') {
          return Reflect.set(result, key, value);
        }
        if (isRef(res)) {
          res.value = value;
          return true;
        }
        return Reflect.set(target, key, value);
      }
    });
    this.opt = operator;
    this.initialize = this.initialize.bind(operator);

    const hosts = VueWidget.getHookHosts(this);
    hosts.forEach((hookName) => {
      const host = Reflect.get(this, hookName);
      Reflect.set(this, hookName, (...args: unknown[]) => {
        if (hookName === 'render') {
          return host.apply(operator, args);
        }
        const _args = operator.executeBeforeHooks(hookName, args);
        const result = host.apply(operator, _args);
        return operator.executeAfterHooks(hookName, result);
      });
    });
    return operator;
  }

  /**
   * Class Component Vue组件
   * @private
   */
  private widgetComponent: Component | undefined;

  /**
   * 获取Class Component Vue组件
   */
  public getWidgetComponent(isBuild = false): Component | undefined {
    let component = this.widgetComponent;
    if (!component && isBuild) {
      component = this.buildWidgetComponent();
      this.widgetComponent = component;
    }
    return component;
  }

  /**
   * 设置Class Component Vue组件
   * @param component Vue组件
   */
  public setWidgetComponent(component: Component | undefined) {
    this.widgetComponent = component;
  }

  /**
   * 扩展组件
   */
  public renderExpandComponent(): Component | VNode | undefined {
    return undefined;
  }

  /**
   * 混入组件
   * @private
   */
  private mixinComponent: Component | undefined;

  /**
   * 获取混入组件
   */
  public getMixinComponent() {
    return this.mixinComponent;
  }

  /**
   * 设置混入组件
   * @param component Vue组件
   * @protected
   */
  public setMixinComponent(component: Component | undefined) {
    if (component) {
      component = {
        inheritAttrs: false,
        ...component
      };
    }
    this.mixinComponent = component;
  }

  /**
   * 渲染当前组件
   * @param context 渲染上下文
   * @param slots 插槽
   */
  @VueWidget.HookHost()
  public render(context?: Record<string, unknown>, slots?: Slots): VNode | VNode[] {
    if (!this.widgetComponent) {
      this.widgetComponent = this.buildWidgetComponent();
    }
    if (!this.widgetComponent) {
      return [];
    }
    return this.renderWidgetComponent(this.widgetComponent, context, slots);
  }

  protected getWidgetComponentName() {
    const { name } = this.constructor;
    return name;
  }

  /**
   * 构造Vue组件
   * @protected
   */
  protected buildWidgetComponent(): Component | undefined {
    let component = this.getComponent();
    if (!component) {
      return undefined;
    }
    component = toRaw(component);
    // const setup: any = this.setup(this.setupHook.bind(this));

    const opt = this.getOperator();
    const extendComponents = this.getUsingComponents();
    return defineComponent({
      name: this.getWidgetComponentName(),
      components: extendComponents,
      inheritAttrs: false,
      setup: this.setup(this.setupHook.bind(this)) as any,
      beforeMount: () => {
        this.behaviorGroup[BehaviorName.beforeMount]?.();
        this.$$beforeMount.call(opt);
        this.beforeMount.call(opt);
      },
      mounted: () => {
        this.behaviorGroup[BehaviorName.mounted]?.();
        this.$$mounted.call(opt);
        this.mounted.call(opt);
      },
      beforeUpdate: () => {
        this.behaviorGroup[BehaviorName.beforeUpdate]?.();
        this.$$beforeUpdate.call(opt);
        this.beforeUpdate.call(opt);
      },
      updated: () => {
        this.behaviorGroup[BehaviorName.updated]?.();
        this.$$updated.call(opt);
        this.updated.call(opt);
      },
      activated: () => {
        this.behaviorGroup[BehaviorName.activated]?.();
        this.$$activated.call(opt);
        this.activated.call(opt);
      },
      deactivated: () => {
        this.behaviorGroup[BehaviorName.deactivated]?.();
        this.$$deactivated.call(opt);
        this.deactivated.call(opt);
      },
      beforeUnmount: () => {
        this.behaviorGroup[BehaviorName.beforeUnmount]?.();
        this.$$beforeUnmount.call(opt);
        this.beforeUnmount.call(opt);
      },
      unmounted: () => {
        this.behaviorGroup[BehaviorName.unmounted]?.();
        this.unmounted.call(opt);
        this.$$unmounted.call(opt);
        this.$$unmountedAfterProperties.call(opt);
      },
      render: (ctx: ComponentPublicInstance & Record<string, unknown>) => {
        const props = this.buildProps(ctx);
        const { $slots } = ctx;
        const componentProps = this.resolveProps(component, props);

        const children = $slots && Object.keys($slots).length ? $slots : this.resolveChildren();

        const expandCom = this.renderExpandComponent() as VNode;
        const expandSlot = {} as Record<string, any>;

        if (expandCom) {
          const defaultSlotContent = children.default ? children.default() : [];
          expandSlot.default = () => [...defaultSlotContent, expandCom];
        }

        return this.renderMixinComponent(
          createVNode(component, componentProps, {
            ...children,
            ...expandSlot
          }),
          props
        );
      }
    });
  }

  /**
   * 只获取vue 组件需要的props
   *
   */
  protected resolveProps(component, props) {
    return props;
    // TODO 由于很多组件内部使用了$attrs, 需要先把$attrs替换成对应的props，再使用下面的代码，性能可提升20%
    // const componentProps = (component as VNode).props || {};
    // const keys = Array.isArray(componentProps) ? componentProps : Object.keys(componentProps);

    // if (component.mixins && component.mixins.length) {
    //   keys.push(...component.mixins.map((mixin) => Object.keys(mixin.props || {})));
    // }

    // return keys.reduce((acc, key) => ({ ...acc, [key]: props[key] }), {});
  }

  /**
   * 渲染混入组件
   * @param vNode 当前Vue组件渲染节点
   * @param props 当前Vue组件渲染属性
   * @protected
   */
  protected renderMixinComponent(vNode: VNode, props: Record<string, unknown>): VNode | VNode[] {
    const mixinComponent = this.getMixinComponent();
    if (mixinComponent) {
      const finalVNode = vNode;
      const realProps = this.resolveProps(mixinComponent, props);
      vNode = createVNode(mixinComponent, realProps, { default: () => finalVNode });
    }
    return vNode;
  }

  /**
   * 渲染当前组件
   * @param widgetComponent 当前组件
   * @param context 组件上下文
   * @param slots 组件插槽
   * @protected
   */
  protected renderWidgetComponent(widgetComponent: Component, context?: Record<string, unknown>, slots?: Slots): VNode {
    return createVNode(widgetComponent, {}, slots);
  }

  /**
   * 构建当前组件渲染vue组件传递时的props
   * @param result
   * @protected
   */
  protected buildProps(result: Record<string, unknown>) {
    const props: Record<string, unknown> = {};

    const attrs = this.getAttributes();

    const propStrs = this.getProps();
    attrs.forEach((displayName, nativeName) => {
      if (propStrs.includes(displayName)) {
        Reflect.set(props, displayName, Reflect.get(result, nativeName));
      }
    });
    props['data-handle'] = this.getHandle();
    return props;
  }

  protected buildPropsStrs(): string[] {
    const attrs = this.getProps();
    const props: string[] = [];
    attrs.forEach((key) => props.push(key));
    return props;
  }

  /**
   * 将当前组件的子组件树解析为Vue Slots树
   * @protected
   */
  protected resolveChildren(): Record<string, Slot> {
    const result = {};
    const slots: string[] = [];
    const children = this.getChildren();
    children.forEach((c) => {
      if (!slots.includes(c.getName())) {
        slots.push(c.getName());
      }
    });
    slots.forEach((s) => {
      Reflect.set(result, s, (...args: unknown[]) =>
        children.filter((c) => c.getName() === s).map((c) => c.render(...args))
      );
    });
    return result;
  }

  /**
   * Vue组件setup方法钩子
   * @param _ctx
   * @param _props
   * @param _result
   * @protected
   */
  protected setupHook(_ctx: void, _props: unknown, _result: unknown): unknown {
    this.behaviorGroup[BehaviorName.beforeCreated]?.();
    this.$$beforeCreated();
    this.beforeCreated();
    this.behaviorGroup[BehaviorName.created]?.();
    this.$$created();
    this.created();
    return {};
  }

  /**
   * 绑定一个标准的Vue组件或者一个html标签用于当前组件的渲染
   * @param component
   */
  public setComponent(component: WidgetComponent) {
    this.component = {
      inheritAttrs: false,
      ...(component as Component)
    };
  }

  /**
   * 销毁当前组件
   */
  public dispose(force = false) {
    super.dispose(force);
    this.opt = undefined;

    const empty = null as any;

    if (this.__scope) {
      this.__scope.stop();
      this.__scope = empty;
    }
    this.component = empty;
    this.mixinComponent = empty;
    this.widgetComponent = empty;

    /**
     * 销毁 响应式依赖收集、原型链的属性、事件
     */
    if (force) {
      nextTick(() => {
        this.res = {};
        (this as any).__proto__ = null;
      });
    }
  }

  /**
   * 获取当前组件渲染时使用的Vue组件
   * @public
   */
  public getComponent() {
    const { name, __render__, __name__ } = this.constructor as Function & { __render__: Function; __name__: string };
    if (!!__render__) {
      this.component = defineComponent({
        name: __name__ || name,
        props: this.buildPropsStrs(),
        render: __render__,
        components: this.getUsingComponents()
      });
    }
    return this.component;
  }

  /**
   * 获取当前组件引用的其他Vue组件
   * @protected
   */
  protected getUsingComponents(): Record<string, Component> {
    return {};
  }

  private executeAfterHooks(name: string, result: unknown) {
    const hooks = VueWidget.getHooks(this.getHandle(), name, 'after');
    let index = 0;
    const res = { result };
    const next = () => {
      index < hooks.length && hooks[index++].apply(this, [next, res]);
    };
    next();
    return res.result;
  }

  private executeBeforeHooks(name: string, ...args: unknown[]) {
    const hooks = VueWidget.getHooks(this.getHandle(), name, 'before');
    let index = 0;
    const _args = { args };
    const next = () => {
      index < hooks.length && hooks[index++].apply(this, [next, _args]);
    };
    next();
    return _args.args;
  }

  /**
   * Vue钩子
   * @protected
   */
  protected beforeCreated() {}

  /**
   * @internal
   */
  protected $$beforeCreated() {}

  /**
   * Vue钩子
   * @protected
   */
  protected created() {}

  /**
   * @internal
   */
  protected $$created() {}

  /**
   * Vue钩子
   * @protected
   */
  protected beforeMount() {}

  /**
   * @internal
   */
  protected $$beforeMount() {}

  /**
   * Vue钩子
   * @protected
   */
  protected mounted() {}

  /**
   * @internal
   */
  protected $$mounted() {}

  /**
   * Vue钩子
   * @protected
   */
  protected beforeUpdate() {}

  /**
   * @internal
   */
  protected $$beforeUpdate() {}

  /**
   * Vue钩子
   * @protected
   */
  protected updated() {}

  /**
   * @internal
   */
  protected $$updated() {}

  /**
   * Vue钩子
   * @protected
   */
  protected activated() {}

  /**
   * @internal
   */
  protected $$activated() {}

  /**
   * Vue钩子
   * @protected
   */
  protected deactivated() {}

  /**
   * @internal
   */
  protected $$deactivated() {}

  /**
   * Vue钩子
   * @protected
   */
  protected beforeUnmount() {}

  /**
   * @internal
   */
  protected $$beforeUnmount() {}

  /**
   * Vue钩子
   * @protected
   */
  protected unmounted() {}

  /**
   * @internal
   */
  protected $$unmounted() {}

  protected $$unmountedAfterProperties() {
    this.dispose();
  }

  public registryBehavior(name: keyof typeof BehaviorName, cb: () => void) {
    this.behaviorGroup[name] = cb;
  }

  protected reset() {
    this.widgetComponent = undefined;
    (this.getParent() as VueWidget).node_code = this.revolveNodeCode();
  }

  @Widget.Reactive()
  protected translate(key, values: { [key: string]: any } = {}): string {
    const translate = Reflect.get(window, 'translate');

    const result = translate ? translate(key) : '';

    if (result === key || Object.keys(values).length === 0) {
      return result;
    }

    const regExp = /\{\s*([A-Z0-9_]+)\s*\}/gi;

    return result.replace(regExp, (matched: string, k: string): string => values[k]);
  }

  @Widget.Reactive()
  protected translateByI18n(key: string): string {
    return translateValueByKey(key) || key;
  }

  @Widget.Method()
  protected genStaticPath(resourceName: string) {
    return genStaticPath(resourceName);
  }

  public forceUpdate() {
    const opt = this.getOperator();
    if (opt) {
      opt.node_code = this.revolveNodeCode();
    }
  }
}

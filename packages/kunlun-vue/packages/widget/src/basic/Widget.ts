import { IWidget, WidgetConstructor, WidgetProps } from '@oinone/kunlun-engine';
import { instantiate } from '@oinone/kunlun-shared';
import { BehaviorSubject, Subject, Subscription } from '@oinone/kunlun-state';
import { InnerWidgetType } from '../typing/typing';

interface NameContextMap<T> {
  paramName_NameMap: Map<string, Symbol>;
  subject: BehaviorSubject<T> | Subject<T>;
  value?: T;
}

interface BaseWidgetSubjection<T> {
  subscribe: (func: (data: T) => void) => Subscription;
  subject: BehaviorSubject<T> | Subject<T>;
}

export interface WidgetSubjection<T> extends BaseWidgetSubjection<T> {
  subject: Subject<T>;
}

export interface WidgetBehaviorSubjection<T> extends BaseWidgetSubjection<T> {
  subject: BehaviorSubject<T>;
}

export type watcher<T> = { path: string; handler: (newVal: T, oldVal: T) => void; options?: { deep?: boolean } };
export type HANDLE = string;

export abstract class Widget<Props extends WidgetProps = WidgetProps, R = unknown> implements IWidget<Props> {
  private static widgetCount = 0;

  private static createHandle(name = ''): HANDLE {
    return `${name || 'oio-widget'}-${this.widgetCount++}`;
  }

  private static widgetMap: Map<string, Widget> = new Map();

  private static attributeMap: Map<Function, Map<string, string>> = new Map();

  private static protoChainsCache = new WeakMap<Function, Function[]>();

  private static watchMap: Map<Function, watcher<unknown>[]> = new Map();

  private static nameContextMap: Map<Symbol, NameContextMap<unknown>> = new Map();

  private subscriptionMap = new Map<Symbol, Subscription>();

  private $$props?: string[];

  private static Attribute(params?: { displayName?: string; render?: boolean }) {
    return <T extends Widget, K>(target: T, nativeName: string, description?: TypedPropertyDescriptor<K>) => {
      const widgetType = target.constructor;
      const attrs = this.attributeMap.get(widgetType) || new Map();
      attrs.set((params && params.displayName) || nativeName, nativeName);
      this.attributeMap.set(widgetType, attrs);
      if (description && description.get) {
        target[`$compute$${nativeName}`] = { get: description.get, set: description.set };
      }
      const $$props = widgetType.prototype.$$props || [];
      if (!params || params.render !== false) {
        $$props.push((params && params.displayName) || nativeName);
      }
      target.$$props = $$props;
    };
  }

  /**
   *  添加事件监听
   *
   * @param  {string} path 监听的路径
   * @param  {deep?:boolean;immediate?:boolean} options?
   *
   * @example
   *
   * @Widget.Watch('formData.name', {deep: true, immediate: true})
   * private watchName(name: string) {
   *   ... todo
   * }
   *
   */
  protected static Watch(path: string, options?: { deep?: boolean; immediate?: boolean }) {
    return <T extends Widget, K>(
      target: T,
      nativeName: string,
      descriptor:
        | TypedPropertyDescriptor<(newValue: K, oldValue?: K) => void>
        | TypedPropertyDescriptor<(newValue: K, oldValue?: K) => Promise<void>>
        | TypedPropertyDescriptor<(newValue?: K, oldValue?: K) => void>
        | TypedPropertyDescriptor<(newValue?: K, oldValue?: K) => Promise<void>>
    ) => {
      const name = target.constructor;
      const watchMap = Widget.watchMap.get(name) || [];
      watchMap.push({
        path,
        handler: descriptor.value! as (newVal: unknown, oldVal?: unknown) => void,
        options
      });
      Widget.watchMap.set(name, watchMap);
    };
  }

  private static Sub<T>(name: Symbol, SubjectType: { new (T): Subject<T> | BehaviorSubject<T> }, value?: T) {
    return <K extends Widget>(target: K, paramName: string) => {
      const nameContextMap = this.nameContextMap.get(name);
      if (!nameContextMap) {
        const subject = new SubjectType(value);
        const paramName_NameMap = new Map<string, Symbol>();
        paramName_NameMap.set(paramName, name);
        this.nameContextMap.set(name, {
          paramName_NameMap,
          subject,
          value
        } as NameContextMap<unknown>);
      } else if (nameContextMap && !nameContextMap.paramName_NameMap.get(paramName)) {
        nameContextMap.paramName_NameMap.set(paramName, name);
      }
    };
  }

  /**
   * 可以用来处理不同widget之间的通讯，当被订阅的时候，会将默认值发送出去
   *
   * @param  {Symbol} name 唯一标示
   * @param  {unknown} value? 默认值
   *
   * @example
   *
   * const identifier = Symbol('example-sub')
   *
   * * field.ts * // 文件
   *
   * @Widget.BehaviorSubContext(identifier, {value: '这是默认值'})
   * private exampleSub!:WidgetBehaviorSubjection<{value: string}>
   *
   * onValueChange() {
   *   this.exampleSub.subject.next({value: '这是新的值'})
   * }
   *
   * * other-field.ts * // 文件
   * @Widget.BehaviorSubContext(identifier, {value: '这是默认值'})
   * private exampleSub!:WidgetBehaviorSubjection<{value: string}>
   *
   * mounted() {
   *  this.exampleSub.subscribe((value) => {
   *    ...todo
   *  })
   * }
   *
   */
  protected static BehaviorSubContext(name: Symbol, value?: unknown) {
    return Widget.Sub(name, BehaviorSubject, value);
  }

  /**
   * 与 `BehaviorSubContext` 一样，区别在于第一次不会发射默认值
   *
   * @param  {Symbol} name 唯一标示
   * @param  {unknown} value? 默认值
   */
  protected static SubContext(name: Symbol, value?: unknown) {
    return Widget.Sub(name, Subject, value);
  }

  /**
   * 将数据绑定为响应式，并且组件中可以获取该值
   */
  protected static Reactive(params?: { displayName?: string; render?: boolean }) {
    return Widget.Attribute(params);
  }

  /**
   * 将方法绑定为能够被组件获取的方法
   */
  protected static Method(displayName?: string) {
    return Widget.Attribute(displayName ? { displayName } : undefined);
  }

  public static select<T extends Widget = Widget>(handle: string): T | undefined {
    return Widget.widgetMap.get(handle) as T | undefined;
  }

  /**
   * 获取上级注入的依赖，与 Provide 一起使用
   *
   * @param  {string|Symbol} injectName? 被注入的name，如果不传递，那么取target中的name
   *
   * @example
   *
   * * children.ts * // 文件
   *
   * @Widget.Inject('InjectName')
   * private rootData!:
   *
   * 如果要将该值变为响应式，如果加上Reactive
   *
   *  @Widget.Reactive()
   *  @Widget.Inject('InjectName')
   *  private rootData!:;
   */
  protected static Inject(injectName?: string | Symbol) {
    return <T extends Widget>(target: T, name: string) => {
      let injection: { name: typeof Widget; list: Map<string | Symbol, string> } = Reflect.get(target, 'injection') || {
        name: this,
        list: new Map()
      };
      if (injection.name !== target.constructor) {
        const oldInjection = injection;
        injection = { name: target.constructor as typeof Widget, list: new Map() };
        oldInjection.list.forEach((v, n) => injection.list.set(n, v));
        Reflect.set(target, 'injection', injection);
      }
      // const injection = Reflect.get(target, 'injection') as Map<string | Symbol, string>;
      if (!injection.list.get(injectName || name)) {
        injection.list.set(injectName || name, name);
      }
    };
  }

  /**
   * 获取下级注入的依赖，与 Inject 一起使用
   *
   * @param  {string|Symbol} provideName? 被注入的name，如果不传递，那么取target中的name
   *
   * @example
   *
   * * parent.ts * // 文件
   *
   * @Widget.Provide('ProvideName')
   * private rootData!:
   *
   * 如果要将该值变为响应式，如果加上Reactive
   *
   *  @Widget.Reactive()
   *  @Widget.Provide('ProvideName')
   *  private rootData!:;
   */
  protected static Provide(provideName?: string | Symbol) {
    return <T extends Widget>(target: T, name: string) => {
      let injection: { name: typeof Widget; list: Map<string | Symbol, string> } = Reflect.get(target, 'provider') || {
        name: this,
        list: new Map()
      };
      if (injection.name !== (target.constructor as typeof Widget)) {
        const old = injection;
        injection = { name: target.constructor as typeof Widget, list: new Map() };
        old.list.forEach((v, k) => injection.list.set(k, v));
        Reflect.set(target, 'provider', injection);
      }
      // const injection = Reflect.get(target, 'injection') as Map<string | Symbol, string>;
      if (!injection.list.get(provideName || name)) {
        injection.list.set(provideName || name, name);
      }
    };
  }

  private parent: Widget | null;

  protected $$innerWidgetType: InnerWidgetType | null | undefined;

  protected childrenInstance: Widget[] = [];

  protected children: Widget[] = [];

  protected childrenWidget: Widget[] = [];

  private readonly handle: string;

  public config: Props = {} as Props;

  private name: string;

  private initialized = false;

  private self: Widget | null;

  public constructor(handle?: string) {
    this.parent = null;
    this.childrenInstance = [];
    this.handle = handle || Widget.createHandle(this.constructor.name);
    this.name = 'default';
    this.self = this;
  }

  protected getSelf() {
    return this.self;
  }

  public getOperator() {
    return this;
  }

  public initialize(config: Props = {} as Props): Widget {
    if (this.initialized) {
      throw new Error(`error: reInitializeWidget:${this.getWidgetType()}:${this.getHandle()}`);
    }

    const props = {};
    const injection = (Reflect.get(this, 'injection') || { list: new Map() }).list as Map<string | Symbol, string>;
    const attrs = this.getAttributes();

    if (injection) {
      injection.forEach((name, injectName) => {
        const shared = this.getShared(injectName);
        if (shared.host !== undefined) {
          Reflect.set(props, name, {
            get: () => {
              return this.getShared(injectName).value;
            },
            configurable: true
          });
          let displayName = '';
          attrs.forEach((nativeName, dname) => (nativeName === name ? (displayName = dname) : ''));
          if (displayName !== '') {
            Reflect.set(this, `$compute$${name}`, { get: () => this.getShared(injectName).value });
          }
        }
      });
    }
    Object.defineProperties(this, props);
    this.initialized = true;
    this.config = config;
    Widget.widgetMap.set(this.getHandle(), this);

    Widget.nameContextMap.forEach((contextMap) => {
      const { subject, paramName_NameMap } = contextMap;
      const d: BaseWidgetSubjection<unknown> = {
        subscribe: (func) => {
          const subscription = subject.subscribe((data) => {
            func(data);
          });
          this.subscriptionMap.set(Symbol('random'), subscription);
          return subscription;
        },
        subject
      };
      paramName_NameMap.forEach((_name, paramName) => {
        this[paramName] = d;
      });
    });

    if (this.$$innerWidgetType) {
      const parentWidget = this.getParentWidget();
      if (parentWidget && parentWidget.$$innerWidgetType) {
        parentWidget.childrenWidget.push(this);
      }
    }

    return this;
  }

  /**
   * 销毁widget
   *
   * 内部会根据handle匹配到对应的widget，然后进行销毁，如果children中出现了相同的handle，那么会销毁第一个
   */
  public dispose(force = false) {
    this.releaseInjection();
    const pchildren = this.parent?.children;
    if (pchildren) {
      const index = pchildren.findIndex((c) => c.getHandle() === this.getHandle());
      if (index !== -1) {
        pchildren.splice(index, 1);
        this.parent?.childrenInstance.splice(index, 1);
      }
    }
    while (this.children.length) {
      this.children[0].dispose(force);
    }

    Widget.widgetMap.delete(this.getHandle());
    this.subscriptionMap.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptionMap.clear();

    this.self = null;

    this.childrenInstance = [];
    this.children = [];
    this.childrenWidget = [];
    this.parent = null;

    force && (this.$$props = undefined);
  }

  /**
   * 创建一个widget
   *
   * @param {Widget} constructor 对应的widget
   * @param {string}  name? 插槽
   * @param {IViewProps}  config? widget中initialize方法接收的参数
   *
   */
  public createWidget<T extends Widget>(
    constructor: WidgetConstructor<T['config'], T>,
    name?: string,
    config?: T['config'],
    specifiedIndex?: number
  ) {
    const child = instantiate(constructor);
    child.parent = this;

    const widget = child.initialize(config);

    const instance = widget && widget.getOperator();
    if (specifiedIndex !== undefined && specifiedIndex >= 0) {
      this.children[specifiedIndex] = instance;
    } else {
      this.children.push(instance);
    }
    if (name) {
      child.name = name;
    }

    return instance as T;
  }

  public getHandle(): HANDLE {
    return this.handle;
  }

  /**
   * 删除指定的widget
   */
  public deleteWidget(name: string): boolean {
    const { length } = this.children;
    this.children.forEach((c, index) => {
      if (c.getHandle() === name) {
        c.dispose();
      }
    });

    return this.children.length !== length;
  }

  public moveChildWidget(endIndex: number, startIndex: number) {
    if (this.parent) {
      this.children[endIndex] = this.children.splice(startIndex, 1, this.children[endIndex])[0];
      this.childrenInstance[endIndex] = this.childrenInstance.splice(startIndex, 1, this.childrenInstance[endIndex])[0];
    }
  }

  public insertWidget(widget: Widget, index: number) {
    if (this.parent) {
      this.children.splice(index, 0, widget);
      this.childrenInstance.splice(index, 0, widget);
    }
  }

  public deleteWidgetByIndex(index: number, handle?: string): boolean {
    const { length } = this.children;
    const handler = handle || this.children[index].getHandle();

    this.children.forEach((c, idx) => {
      if (c.getHandle() === handler && idx === index) {
        c.dispose();
      }
    });
    return this.children.length !== length;
  }

  public getConfig(key: string): unknown {
    return this.config[key];
  }

  public getAllConfig() {
    return this.config;
  }

  public getSibling() {
    if (!this.$$innerWidgetType) {
      return null;
    }

    const parent = this.getParentWidget();

    return parent ? parent.getChildrenWidget() : null;
  }

  /**
   * 返回当前元素在其父元素的子元素节点中的前一个元素节点，如果该元素已经是第一个元素节点，则返回 null
   */
  public previousWidgetSibling() {
    const sibling = this.getSibling();

    if (!sibling) {
      return null;
    }

    const index = sibling.findIndex((w) => w.getHandle() === this.getHandle());
    return index > 0 ? sibling[index - 1] : null;
  }

  /**
   * 返回当前元素在其父元素的子元素节点中的后一个元素节点，如果该元素已经是最后一个元素节点，则返回 null
   */
  public nextWidgetSibling() {
    const sibling = this.getSibling();

    if (!sibling) {
      return null;
    }

    const index = sibling.findIndex((w) => w.getHandle() === this.getHandle());
    return index >= 0 && index < sibling.length - 1 ? sibling[index + 1] : null;
  }

  /**
   * 获取父元素
   */
  public getParentWidget(): Widget | null {
    if (this.$$innerWidgetType) {
      let parentNode = this.parent;

      if (!parentNode) {
        return null;
      }

      while (parentNode) {
        if (parentNode.$$innerWidgetType) {
          return parentNode;
        }

        parentNode = parentNode.parent;
      }
    }

    return this.parent;
  }

  /**
   * 获取子元素
   */
  public getChildrenWidget() {
    return this.childrenWidget.length ? this.childrenWidget : this.getChildrenInstance();
  }

  /**
   * @inner
   *
   */
  public getParent(): Widget | null {
    return this.parent;
  }

  public getName(): string {
    return this.name;
  }

  public getWidgetType(): string {
    return this.constructor.name;
  }

  public static getProtoChains<T extends Function>(obj: T): Function[] {
    let result = Widget.protoChainsCache.get(obj);
    if (result) {
      return result;
    }

    result = [];
    let iterator = obj;
    while (iterator.name !== '') {
      result.push(iterator);
      iterator = Object.getPrototypeOf(iterator);
    }

    Widget.protoChainsCache.set(obj, result);
    return result;
  }

  private currentAttributeMapCache!: Map<string, string>;

  /**
   * 获取所有的属性
   */
  public getAttributes(): Map<string, string> {
    if (this.currentAttributeMapCache) {
      return this.currentAttributeMapCache;
    }

    const chains = Widget.getProtoChains(this.constructor);
    const attrs: Map<string, string> = new Map();
    const excludesAttrs = new Set<string>();

    chains.forEach((ctor) => {
      const localAttrs = Widget.attributeMap.get(ctor);
      if (localAttrs) {
        localAttrs.forEach((displayName, nativeName) => {
          attrs.set(nativeName, displayName);
        });
      }
    });

    return (this.currentAttributeMapCache = attrs);
  }

  /**
   * 获取所有的监听事件
   */
  public getWatchers(): watcher<unknown>[] {
    const watchers: watcher<unknown>[] = [];
    const chains = Widget.getProtoChains(this.constructor);
    chains.forEach((name) => {
      const localWatchers = Widget.watchMap.get(name);
      localWatchers && localWatchers.forEach((watcher) => watchers.push(watcher));
    });
    return watchers;
  }

  /**
   * @deprecated 使用 getChildrenWidget()
   *
   * 获取所有的children
   */
  public getChildren(): Widget[] {
    return this.children;
  }

  /**
   * @inner
   *
   */
  public getChildrenInstance(): Widget[] {
    return this.childrenInstance;
  }

  protected addChildrenInstance(widget: Widget) {
    this.childrenInstance.push(widget);
  }

  protected getShared(injectName: string | Symbol): { host?: Widget; value?: unknown } {
    let parent = this.getParent();
    let name = '';
    while (parent) {
      const provider: Map<string | Symbol, string> = (Reflect.get(parent, 'provider') || { list: new Map() }).list;
      if (provider && provider.get(injectName)) {
        name = provider.get(injectName)!;
        break;
      }
      parent = parent.getParent();
    }
    if (parent) {
      let result = Reflect.get(parent, name);
      if (typeof result === 'function') {
        result = result.bind(parent);
      }
      return { host: parent, value: result };
    }
    return {};
  }

  private releaseInjection() {
    const injection: { list: Map<string | Symbol, string> } = Reflect.get(this, 'injection');
    if (injection) {
      injection.list.forEach((name) => {
        const widget = this.getSelf()!;
        if (!widget) {
          return;
        }
        Reflect.deleteProperty(widget, name);
      });

      Reflect.set(this, 'injection', null);
    }
  }

  public getComputeHandler(name: string) {
    return Reflect.get(this, `$compute$${name}`);
  }

  protected getProps() {
    return this.$$props || [];
  }

  public abstract render(...args): R;
}

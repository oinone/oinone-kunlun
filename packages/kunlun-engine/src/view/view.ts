import { createDefaultXML, XMLTemplateParser } from '@kunlun/dsl';
import { LifeCycleHeart, LifeCycleTypes, ViewEventName, ViewEventNames } from '@kunlun/event';
import { deepClone, IDslNode, IModel, IView, ViewType } from '@kunlun/meta';
import { useMatched } from '@kunlun/router';
import { BehaviorSubject, distinctUntilChanged, filter, pairwise, Subject, Subscription } from '@kunlun/state';
import { isFunction, isPlainObject, isString } from 'lodash-es';
import { IBaseIViewProps, IListValue, IObjectValue, PageViewState } from '../typing/interface';
import { translateNode } from '../util/translate';
import { BaseVM } from './base';

type HandlerEvent = <T = any>(view: T) => void;
type WatchCb<T> = (value: T, oldValue: T) => void;

/**
 * 视图管理区域，管理视图的元数据、rootData、事件监听
 */
export class ViewVM<
  ViewValue extends IObjectValue | IListValue = any,
  IViewProps extends IBaseIViewProps = any,
  IWidget = any
> extends BaseVM<ViewValue, ViewVM> {
  constructor(initializer: IViewProps) {
    super(initializer);
    const { view, model, isRootWidget, isDialogView } = initializer;

    this.view = view;
    this.model = model;
    this.isRootWidget = isRootWidget || true;
    this.isDialogView = isDialogView || false;

    this.openStream();
  }

  public view!: IView;

  private pageViewState: PageViewState = '' as any;

  private viewDataSource$!: BehaviorSubject<ViewValue>;

  public rootData: ViewValue | null = null;

  public rootData$!: Subject<ViewValue>;

  public model!: IModel;

  protected dslNode!: IDslNode;

  private loading = false;

  private loading$!: BehaviorSubject<boolean>;

  public isRootWidget = true;

  public isDialogView = false;

  private stream$!: Subscription;

  private launchWatch = false;

  private ownEventListeners: Record<LifeCycleTypes, Array<HandlerEvent>> = {} as any;

  private streamOpened = true;

  /**
   * 获取流的状态
   * true -> 开启状态
   * false -> 关闭状态
   */
  public getStreamState() {
    return this.streamOpened;
  }

  /**
   * 初始化数据流。
   *
   */
  public openStream() {
    this.viewDataSource$ = new BehaviorSubject<ViewValue>(this.viewData);
    this.rootData$ = new Subject<ViewValue>();
    this.loading$ = new BehaviorSubject<boolean>(false);
  }

  /**
   * 当流被订阅的时候，才能够执行next事件
   *
   * @param {Subject} stream 流
   * @param {unknown} value 数据源
   */
  protected nextIfStreamOpened<S extends Subject<any>, V>(stream: S, value: V) {
    if (this.pageViewState === 'unmount') {
      console.warn('Execute stream fail, Because the page was destroyed');
      return;
    }

    if (stream) {
      if (!stream.closed) {
        stream.next(value);
      } else {
        console.error('Assignment failed. Current data stream has been destroyed!');
      }
    } else {
      console.error('Assignment failed. Current data stream has not been created!');
    }
  }

  /**
   * 获取当前vm视图状态
   */
  public getPageViewState() {
    return this.pageViewState;
  }

  /**
   * 修改当前vm视图状态
   */
  public setPageViewState(state: PageViewState) {
    this.pageViewState = state;
  }

  /**
   * 设置视图数据
   */
  public setViewData(value: ViewValue) {
    const val = value == null ? {} : deepClone(value);
    this.viewData = val;

    if (this.launchWatch) {
      this.nextIfStreamOpened(this.viewDataSource$, val);
    }
  }

  /**
   * 设置loading
   */
  public setBusy(busy: boolean) {
    this.loading = busy;
    this.nextIfStreamOpened(this.loading$, busy);
  }

  /**
   * 获取当前是否处于loading状态
   */
  public getBusy() {
    return this.loading;
  }

  /**
   * 获取当前视图
   */
  public getView() {
    return this.view;
  }

  /**
   * 获取当前模型
   */
  public getModel() {
    return this.model;
  }

  /**
   * 是不是跟节点
   */
  public isRoot() {
    return this.isRootWidget;
  }

  public getDslNode() {
    return this.dslNode;
  }

  public setRootData(rootData: ViewValue) {
    this.rootData = rootData;
    this.rootData && this.nextIfStreamOpened(this.rootData$, this.rootData);
  }

  public setRootDataByKey(key: string, value: any) {
    if (this.rootData) {
      this.rootData[key] = value;
      this.nextIfStreamOpened(this.rootData$, this.rootData);
    }
  }

  public getRootData() {
    return this.rootData;
  }

  public getHandle() {
    return this.id;
  }

  public watchLoading(cb: (busy: boolean) => void) {
    this.loading$.subscribe({
      next(val) {
        cb(val);
      }
    });
  }

  public watchRootData(cb: (data: ViewValue) => void) {
    if (!this.rootData$.closed) {
      this.rootData$.subscribe({
        next(val) {
          cb(val);
        }
      });
    }
    this.rootData && this.nextIfStreamOpened(this.rootData$, this.rootData);
  }

  /**
   * 加载元数据，允许被重写
   *
   * @param  {IModel} model 模型
   * @param  {IDslNode} dslNode? dslNode，如果不传入，会自动创建
   * @param  {IView} v? 视图，如果不传入，会自动创建
   * @param  {ViewType} viewType? 指定视图类型
   */
  public loadMetadata(model: IModel, dslNode?: IDslNode, view?: IView, viewType?: ViewType) {
    if (!model) {
      return;
    }

    this.model = model;

    if (view) {
      this.view = view;
    }

    // 初始化view
    if (!this.view || !Object.keys(this.view).length) {
      let type: ViewType = viewType!;

      if (!viewType) {
        // 如果是根节点，那么取模型里面对应的view
        if (this.isRoot()) {
          const page = useMatched().matched.segmentParams.page;

          type = page.viewType;
        } else {
          // const parent = this.getParent()! as ViewWidget;
          // type = parent.getDsl().widget!.toLocaleUpperCase() as ViewType;
        }
      }

      this.view = (model.viewList || [])
        .sort((a, b) => {
          return Number(a.priority) - Number(b.priority);
        })
        .find((item) => item.type === type)!;

      // 如果上面的逻辑处理完成后，还没有view，就需要创建一个view
      if (!this.view) {
        this.view = {
          template: createDefaultXML(this.model, type),
          model: this.model.model,
          type,
          id: this.getHandle(),
          name: `inner_view_${this.getHandle()}`,
          priority: -1
        };
      }
    }

    if (dslNode && Object.keys(dslNode).length) {
      /**
       * 如果传入了dslNode，但是没有传入视图，就要清除 `template`,
       *  因为`template`可能是动态生成的，会导致跟dslNode不匹配
       *  正确的做法应该是根据传入的dslNode反响解析成xml
       */
      if (!view) {
        this.view = {
          ...this.view,
          template: ''
        };
      }

      this.dslNode = dslNode;
    } else if (!this.dslNode || !Object.keys(this.dslNode).length) {
      // 初始化dslNode
      dslNode = new XMLTemplateParser().parser(this.view.template).root;
      translateNode(dslNode);

      this.dslNode = dslNode;
    }
  }

  public on<V = any>(event: { [key in ViewEventName]?: (view: V) => void }): void;
  public on<V = any>(event: ViewEventName, handler: (view: V) => void): void;
  public on<V = any>(
    event: ViewEventName | { [key in ViewEventName]?: (view: V) => void },
    handler?: (view: V) => void
  ) {
    let handlers: { [key in ViewEventName]?: (view: V) => void };

    if (isString(event)) {
      if (!isFunction(handler)) {
        return;
      }

      handlers = { [event]: handler };
    } else {
      if (!isPlainObject(event)) {
        return;
      }
      handlers = event;
    }

    Object.entries(handlers).forEach(([key, h]) => {
      const value = ViewEventNames[key];

      if (value) {
        if (this.ownEventListeners[value]) {
          this.ownEventListeners[value].push(h);
        }

        this.ownEventListeners[value] = [h];
      }
    });
  }

  /**
   * 用来监听视图数据的的变化「FormWidget、TableWidget」
   *
   * @param {(value, oldValue):void} cb 监听数据发生变化的回调函数
   * @param {object} options 可配置选项
   *         watchKey -> 当key对应的value发生变化后，才会触发回调用函数
   *                      "如果要监听的数据是对象，那么该参数不会生效"
   *         distinct -> 是否去重（当上一个值跟当前的值相当的时候，就不会处理）
   *
   * @see 当数据发生变化后，触发watch的实现 {@link FormWidget.watchData} {@link TableWidget.handleDataSourceChange}
   *
   * @example
   * const widget = this.createWidget(FormWidget, undefined, {....})
   * widget.watch((value) => {....})
   *
   */
  public watch(cb: WatchCb<ViewValue>);
  public watch(cb: WatchCb<ViewValue>, options: { watchKey?: string; distinct?: boolean });
  public watch(cb: WatchCb<ViewValue>, options: { watchKey?: string[]; distinct?: boolean });

  public watch(cb: WatchCb<ViewValue>, options?: { watchKey?: string | string[]; distinct?: boolean }) {
    this.launchWatch = true;

    if (this.viewDataSource$) {
      let stream = this.viewDataSource$.pipe(pairwise());

      if (options) {
        if (options.watchKey) {
          stream = stream.pipe(
            filter(([pre, next]) => {
              return this.filterWatchData(pre, next, options.watchKey!);
            })
          );
        }

        if (options.distinct) {
          stream = stream.pipe(
            distinctUntilChanged((x, y) => {
              return JSON.stringify(y[0] || {}) === JSON.stringify(y[1] || {});
            })
          );
        }
      }

      this.stream$ = stream.subscribe({
        next: ([pre, next]) => {
          cb(next, pre);
        }
      });

      this.viewDataSource$.next(this.viewData);
    } else {
      console.error('viewDataSource$ has not been created.', this);
    }
  }

  /**
   * 如果没有key，就不做任何处理
   * 如果key不是字符串类型，也不是数组类型，那么不做任何处理
   */
  public filterWatchData(pre: ViewValue, next: ViewValue, key: string | string[]) {
    if (!key) {
      return true;
    }

    if (Array.isArray(pre) || Array.isArray(next)) {
      return true;
    }

    if (typeof key === 'string') {
      return pre[key] !== next[key];
    }

    if (Array.isArray(key)) {
      const preKeyValue = key.map((k) => (pre ? pre[k] : null)).filter((v) => v !== null && v !== undefined);
      const nextKeyValue = key.map((k) => (next ? next[k] : null)).filter((v) => v !== null && v !== undefined);

      if (JSON.stringify(preKeyValue) === JSON.stringify(nextKeyValue)) {
        return false;
      }

      return true;
    }

    return true;
  }

  /**
   * 触发事件
   */
  public notify(type: LifeCycleTypes) {
    // 字段内部监听
    if (this.ownEventListeners[type]) {
      this.ownEventListeners[type].forEach((h) => h(this));
    }

    if (this.view && this.view.name) {
      LifeCycleHeart.publish<ViewVM<ViewValue, IViewProps, IWidget>>(type, this.view.name, this);
    }
  }

  /**
   * 取消所有的事件订阅
   */
  public unsubscribe() {
    this.viewDataSource$.unsubscribe();
    this.loading$.unsubscribe();
    this.rootData$.unsubscribe();
    this.stream$?.unsubscribe();

    this.ownEventListeners = {} as any;

    if (this.view && this.view.name) {
      LifeCycleHeart.disposeLifeCycle(this.view.name);
    }

    this.streamOpened = false;

    this.dispose();
  }
}

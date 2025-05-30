import { EntityBody, IViewProps, ListVM, ObjectVM, RuntimeModel, ViewVM } from '@kunlun/engine';
import { LifeCycleTypes, ViewEventName } from '@kunlun/event';
import { createViewElement, Entity, IDslNode, IModel, IView, ViewElement, ViewId, ViewType } from '@kunlun/meta';
import { Matched, useMatched } from '@kunlun/router';
import { Constructor } from '@kunlun/shared';
import { SPI, SPIOptions, SPISingleSelector, SPITokenFactory } from '@kunlun/spi';
import { Subscription } from '@kunlun/state';

import { Widget } from '../basic';

import { DslNodeWidget } from '../dsl/DslNodeWidget';

export interface IViewFilterOptions extends SPIOptions {
  id?: ViewId[] | ViewId;
  name?: string[] | string;
  type?: ViewType[] | ViewType;
  model?: string[] | string;
  widget?: string[] | string;
  tagName?: string[] | string;
}

type WatchCb<T> = (value: T, oldValue: T) => void;

@SPI.Base('View', ['id', 'name', 'type', 'model', 'widget', 'tagName'])
export abstract class ViewWidget<
  ViewData = any,
  VP extends IViewProps = any,
  VM extends ListVM | ObjectVM = any
> extends DslNodeWidget<VP> {
  public static Token: SPITokenFactory<IViewFilterOptions>;

  public static Selector: SPISingleSelector<IViewFilterOptions, Constructor<ViewWidget>>;

  @Widget.Reactive()
  protected loading = false;

  protected currentRoute: Matched = {} as Matched;

  public rootData!: EntityBody;

  private subjectRoute$!: Subscription;

  private $$vm!: VM;

  public getVM(): VM {
    return this.$$vm;
  }

  public setVM($$vm: VM) {
    this.$$vm = $$vm;
  }

  /**
   * 设置loading
   */
  public setBusy(busy: boolean) {
    this.getVM().setBusy(busy);
  }

  /**
   * 获取url参数
   *
   * @returns {Record<string, string>}
   */
  public getUrlParams() {
    const { page = {} } = useMatched().matched.segmentParams;
    return page;
  }

  /**
   * 获取当前是否处于loading状态
   */
  public getBusy() {
    return this.loading;
  }

  public initialize(props: VP) {
    if (props.isRootView == null) {
      props.isRootView = true;
    }

    super.initialize(props);

    this.isRootView = props.isRootView || false;

    if (props.view) {
      this.view = props.view;
    }

    if (this.rootHandleStr == null && props.isRootWidget) {
      this.currentRootHandlerStr = this.getHandle();
    }

    this.selfHandleStr = this.getHandle();
    this.isDialogView = props.isDialogView || false;

    this.model = props.model! as unknown as RuntimeModel;

    this.setVM(
      new ViewVM({
        view: props.view!,
        dslNode: props.dslNode,
        model: props.model!,
        isRootWidget: props.isRootWidget === false ? props.isRootWidget : true,
        isDialogView: props.isDialogView || false,
        isRootView: props.isRootView
      }) as VM
    );

    this.getVM().isRootWidget = this.isRoot;
    this.getVM().isDialogView = this.isDialogView;

    // this.watchRootData$();

    return this;
  }

  protected domain = '';

  @Widget.Inject()
  @Widget.Reactive()
  private filter!: string;

  @Widget.Reactive()
  @Widget.Inject('rootHandleStr')
  private parentRootHandlerStr: string | undefined;

  @Widget.Reactive()
  private currentRootHandlerStr: string | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  private get rootHandleStr(): string | undefined {
    return this.currentRootHandlerStr || this.parentRootHandlerStr;
  }

  @Widget.Reactive()
  public isRootView = true;

  /**
   * 监听视图的事件
   * @param  event 事件名 / 事件对象
   * @param  handler? 回调函数
   *
   * @example
   *
   * 单个事件监听
   * viewWidget.on('change', (fieldInstance) => {})
   * viewWidget.on('blur', (fieldInstance) => {})
   */
  public on<V = ViewWidget>(event: { [key in ViewEventName]?: (view: V) => void }): void;

  /**
   * 多个事件监听
   *
   * @example
   *
   * viewWidget.on({
   *  change(fieldInstance) => {},
   *  blur(fieldInstance) => {},
   * })
   */
  public on<V = ViewWidget>(event: ViewEventName, handler: (view: V) => void): void;

  public on<V = ViewWidget>(
    event: ViewEventName | { [key in ViewEventName]?: (view: V) => void },
    handler?: (view: V) => void
  ) {
    this.getVM().on(event as any, handler as any);
  }

  /**
   * 用来监听视图数据的的变化
   *
   * @param {(value, oldValue):void} cb 监听数据发生变化的回调函数
   * @param {object} options 可配置选项
   *         watchKey -> 当key对应的value发生变化后，才会触发回调用函数
   *                      "如果要监听的数据是对象，那么该参数不会生效"
   *         distinct -> 是否去重（当上一个值跟当前的值相当的时候，就不会处理）
   *
   * @example
   * const widget = this.createWidget(FormWidget, undefined, {....})
   * widget.watch((value) => {....})
   *
   */
  public watch(cb: WatchCb<ViewData>);
  public watch(cb: WatchCb<ViewData>, options: { watchKey?: string; distinct?: boolean });
  public watch(cb: WatchCb<ViewData>, options: { watchKey?: string[]; distinct?: boolean });

  public watch(cb: WatchCb<ViewData>, options?: { watchKey?: string | string[]; distinct?: boolean }) {
    this.getVM().watch(cb as any, options as any);
  }

  /**
   * 如果没有key，就不做任何处理
   * 如果key不是字符串类型，也不是数组类型，那么不做任何处理
   */
  protected filterWatchData(pre: ViewData, next: ViewData, key: string | string[]) {
    return this.getVM().filterWatchData(pre as any, next as any, key as any);
  }

  public isDialogView = false;

  /**
   * 当前的widget是不是更节点
   */
  @Widget.Reactive()
  public get isRoot() {
    return this.rootHandleStr === this.getHandle();
  }

  @Widget.Reactive()
  public get useConstruct() {
    return this.isRoot || this.isDialogView;
  }

  @Widget.Provide()
  private selfHandleStr = '';

  @Widget.Reactive()
  @Widget.Provide('view')
  public view!: IView;

  @Widget.Reactive()
  @Widget.Provide('viewModel')
  protected model: RuntimeModel | null = null;

  protected type: 'FORM' | 'TABLE' | 'UNKNOWN' = 'UNKNOWN';

  /**
   * 页面默认的参数, A页面跳转到B页面，期望能带入参数过去
   */
  protected initQueryParams: Record<string, string> | null = null;

  public get viewElement(): ViewElement | any {
    return createViewElement(this.dslNode);
  }

  protected resolveTemplate() {}

  public fetchData(data?: Entity[], options?, variables?: Record<string, unknown>): unknown {
    return {};
  }

  public onRowsChange(data: any[]) {}

  public loadData(data: ViewData, reset?: boolean): unknown {
    return {};
  }

  /**
   * 加载`rootData` 数据
   */
  public loadRootData(content: any) {
    this.getVM().setRootData(content);
  }

  public setRootDataByKey(key: string, value: any) {
    const data = this.getVM().getRootData();

    if (data) {
      data[key] = value;
      this.getVM().setRootData(data as any);
    }
  }

  public submit(): unknown {
    return {};
  }

  public getData() {
    return this.getVM().getData() as ViewData;
  }

  public setData(content: ViewData) {
    this.getVM().setData(content as any);
  }

  public async validator(): Promise<any[]> {
    return [];
  }

  /**
   * 加载元数据，允许被重写
   *
   * @param  {IModel} model 模型
   * @param  {IDslNode} dslNode? dslNode，如果不传入，会自动创建
   * @param  {IView} view? 视图，如果不传入，会自动创建
   * @param  {ViewType} viewType? 指定视图类型
   */
  public loadMetadata(model: IModel, dslNode?: IDslNode, view?: IView, viewType?: ViewType) {
    this.getVM().loadMetadata(model as unknown as IModel, dslNode, view, viewType);

    this.model = this.getVM().getModel() as unknown as RuntimeModel;
    this.view = this.getVM().getView();

    if (!this.dslNode) {
      if (dslNode) {
        this.dslNode = dslNode;
      } else {
        this.dslNode = this.getVM().getDslNode();
      }
    }
  }

  public getActiveRecords(): Entity[] {
    return [];
  }

  public setDomain(domain: string) {
    this.domain = domain;
  }

  public getDomain() {
    return this.domain;
  }

  public setFilter(f: string) {
    this.filter = f;
  }

  public getFilter() {
    return this.filter;
  }

  public getModel() {
    return this.getVM().getModel();
  }

  public getView() {
    return this.getVM().getView();
  }

  @Widget.Reactive()
  public path!: string;

  public getPath() {
    return this.path;
  }

  public notify(type: LifeCycleTypes) {
    this.getVM().notify(type);
  }

  public $$beforeCreated() {
    const { initQueryParams = '{}' } = this.getUrlParams();
    try {
      const params = JSON.parse(initQueryParams);
      this.initQueryParams = Object.keys(params).length ? params : null;
    } catch (error) {
      this.initQueryParams = null;
    }

    this.notify(LifeCycleTypes.ON_VIEW_BEFORE_CREATED);
  }

  public $$created() {
    this.notify(LifeCycleTypes.ON_VIEW_CREATED);
  }

  public $$beforeMount() {
    this.notify(LifeCycleTypes.ON_VIEW_BEFORE_MOUNT);
  }

  public $$mounted() {
    this.getVM().setPageViewState('mount');

    this.getVM().watchLoading((loading) => {
      this.loading = loading;
    });

    const { getMatched$ } = useMatched();

    this.subjectRoute$ = getMatched$()!.subscribe((route) => {
      this.currentRoute = route;
    });

    this.notify(LifeCycleTypes.ON_VIEW_MOUNTED);
  }

  public $$beforeUpdate() {
    this.notify(LifeCycleTypes.ON_VIEW_BEFORE_UPDATE);
  }

  public $$updated() {
    this.notify(LifeCycleTypes.ON_VIEW_UPDATED);
  }

  public $$beforeUnmount() {
    this.notify(LifeCycleTypes.ON_VIEW_BEFORE_UNMOUNT);
  }

  public $$unmounted() {
    this.getVM().setPageViewState('unmount');

    /**
     * 只有当视图真正被卸载的时候，才需要销毁数据流。
     * 当视图状态频繁的从 mounted -> unmounted -> mounted -> unmounted ->mounted 并且以 mounted 结尾的时候，是不需要触发数据流的销毁
     *
     * 因为视图的 挂载、销毁是 同步 执行的，需要需要开启一个 宏任务 来判断
     */

    const t = setTimeout(() => {
      if (this.getVM().getPageViewState() === 'unmount') {
        this.notify(LifeCycleTypes.ON_VIEW_UNMOUNTED);
        this.getVM().unsubscribe();
      }
      clearTimeout(t);
    });
  }
}

/**
 * @deprecated 移动端未修改，必须移除该定义
 */
export const ViewSubSymbol = Symbol('view');

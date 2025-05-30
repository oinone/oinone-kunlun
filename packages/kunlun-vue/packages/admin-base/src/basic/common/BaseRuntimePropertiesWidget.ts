import { ActiveRecord, RuntimeModel, RuntimeView, RuntimeViewAction } from '@kunlun/engine';
import { ViewClientType } from '@kunlun/meta';
import { useMatched } from '@kunlun/router';
import { BooleanHelper, Optional, StringHelper } from '@kunlun/shared';
import { ActiveRecordsWidget, ActiveRecordsWidgetProps, Widget } from '@kunlun/vue-widget';
import { UrlQueryParameters } from '../types';

// fixme @zbh 20230209 获取真实的当前客户端类型
function getCurrentClientType(): ViewClientType {
  return ViewClientType.PC;
}

/**
 * 运行时属性组件
 */
export class BaseRuntimePropertiesWidget<
  Props extends ActiveRecordsWidgetProps = ActiveRecordsWidgetProps
> extends ActiveRecordsWidget<Props> {
  @Widget.Reactive()
  @Widget.Inject('openerDataSource')
  protected parentOpenerDataSource: ActiveRecord[] | undefined;

  @Widget.Reactive()
  protected get openerDataSource(): ActiveRecord[] | undefined {
    return this.parentOpenerDataSource;
  }

  @Widget.Reactive()
  @Widget.Inject('openerActiveRecords')
  protected parentOpenerActiveRecords: ActiveRecord[] | undefined;

  @Widget.Reactive()
  public get openerActiveRecords(): ActiveRecord[] | undefined {
    return this.parentOpenerActiveRecords;
  }

  @Widget.Reactive()
  protected get supportClientTypes(): ViewClientType[] {
    return (StringHelper.convertArray(this.getDsl().clientTypes) || []).map((v) => v.toUpperCase()) as ViewClientType[];
  }

  @Widget.Reactive()
  protected get isSupportPCClient(): boolean {
    if (getCurrentClientType() !== ViewClientType.PC) {
      return false;
    }
    const { supportClientTypes } = this;
    if (!supportClientTypes.length) {
      return true;
    }
    return supportClientTypes.includes(ViewClientType.PC);
  }

  @Widget.Reactive()
  protected get isSupportMobileClient(): boolean {
    if (getCurrentClientType() !== ViewClientType.MOBILE) {
      return false;
    }
    const { supportClientTypes } = this;
    if (!supportClientTypes.length) {
      return true;
    }
    return supportClientTypes.includes(ViewClientType.MOBILE);
  }

  @Widget.Reactive()
  protected get isSupportCurrentClient(): boolean {
    if (this.isSupportPCClient) {
      return true;
    }
    if (this.isSupportMobileClient) {
      return true;
    }
    return false;
  }

  @Widget.Reactive()
  public get invisible(): boolean {
    if (!this.isSupportCurrentClient) {
      return true;
    }
    return super.invisible;
  }

  /**
   * 运行时模型
   */
  public get model(): RuntimeModel {
    const model = this.rootRuntimeContext.model;
    if (!model) {
      throw new Error('Invalid model define.');
    }
    return model;
  }

  /**
   * 运行时视图动作
   */
  public get viewAction(): RuntimeViewAction | undefined {
    return this.metadataRuntimeContext.viewAction;
  }

  /**
   * 运行时视图
   */
  public get view(): RuntimeView | undefined {
    return this.rootRuntimeContext.view;
  }

  /**
   * 视图初始值
   */
  public get initialValue(): ActiveRecord[] | undefined {
    return this.viewAction?.resView?.initialValue;
  }

  /**
   * 视图初始上下文
   */
  public get initialContext(): Record<string, unknown> | undefined {
    const { context } = this.urlParameters;
    if (context) {
      return JSON.parse(context);
    }
    return this.viewAction?.resView?.context;
  }

  /**
   * 获取url参数（内联组件如需要获取url参数，请使用{@link BaseRuntimePropertiesWidget#getUrlParameters}方法）
   */
  public get urlParameters(): UrlQueryParameters {
    if (this.inline) {
      return {};
    }
    return this.getUrlParameters();
  }

  /**
   * 获取url参数
   */
  public getUrlParameters(): UrlQueryParameters {
    const { page = {} } = useMatched().matched.segmentParams;
    return page;
  }

  /**
   * 场景
   */
  public get scene(): string {
    const { action } = this.urlParameters;
    if (action) {
      return action;
    }
    return this.viewAction?.name || '';
  }

  /**
   * 加载状态，使用{@link BaseRuntimePropertiesWidget#load}方法调用
   * @protected
   */
  @Widget.Reactive()
  protected loading = false;

  @Widget.Method()
  @Widget.Inject('load')
  protected parentLoad: (<R>(fn: (...args) => R, ...args) => Promise<R>) | undefined;

  @Widget.Reactive()
  protected get usingLoading(): boolean {
    return Optional.ofNullable(this.getDsl().usingLoading)
      .map((v) => BooleanHelper.toBoolean(v))
      .orElse(true);
  }

  /**
   * 加载状态调用函数
   * @param fn
   * @param args
   * @protected
   */
  public async load<R>(fn: (...args) => R, ...args): Promise<R> {
    if (!this.usingLoading) {
      return await fn(...args);
    }
    if (this.parentLoad) {
      return await this.parentLoad(fn, ...args);
    }
    this.loading = true;
    try {
      return await fn(...args);
    } finally {
      this.loading = false;
    }
  }
}

import { parseConfigs, RelationUpdateType, SubmitType, SubmitValue } from '@oinone/kunlun-engine';
import { LifeCycleHeart, LifeCycleTypes } from '@oinone/kunlun-event';
import { ViewMode } from '@oinone/kunlun-meta';
import { Router } from '@oinone/kunlun-router';
import { CallChaining, RSQLHelper } from '@oinone/kunlun-shared';
import { useRouter } from '@oinone/kunlun-vue-router';
import { ActiveRecordsWidgetProps, Widget } from '@oinone/kunlun-vue-widget';
import { FETCH_DATA_WIDGET_PRIORITY } from '../constant';
import { BaseElementWidget } from '../token';

export interface BaseElementViewWidgetProps extends ActiveRecordsWidgetProps {
  viewMode?: ViewMode;
  submitType?: SubmitType;
  relationUpdateType?: RelationUpdateType;
  mountedCallChaining?: CallChaining;
  refreshCallChaining?: CallChaining;
}

export interface ElementViewDataSourceConfig extends Record<string, unknown> {
  /**
   * 手动指定是否当前视图组件为数据源提供者
   * 当手动指定后，将无法进行变更
   */
  provider?: boolean;
}

/**
 * Element视图组件（主要用于视图主要展示组件）
 */
export abstract class BaseElementViewWidget<
  Props extends BaseElementViewWidgetProps = BaseElementViewWidgetProps
> extends BaseElementWidget<Props> {
  protected $router!: Router;

  @Widget.Reactive()
  protected internalDataSourceProvider = false;

  /**
   * 是否是数据源提供者
   * 为true则数据源在当前组件自己查询接口获得数据
   * 为false则可能是父组件直接把数据源提供到当前组件，如O2M表格组件，数据可能是O2M表格字段组件从后端接口提前获取好的
   * @protected
   */
  @Widget.Reactive()
  protected get isDataSourceProvider() {
    const isProvider = this.dataSourceConfig?.provider;
    if (isProvider == null) {
      return this.internalDataSourceProvider;
    }
    return isProvider;
  }

  protected set isDataSourceProvider(value: boolean) {
    const isProvider = this.dataSourceConfig?.provider;
    if (isProvider == null) {
      this.internalDataSourceProvider = value;
    }
  }

  @Widget.Reactive()
  @Widget.Inject('viewMode')
  protected parentViewMode: ViewMode | undefined;

  @Widget.Reactive()
  protected currentViewMode: ViewMode | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get viewMode() {
    return this.currentViewMode || this.parentViewMode || ViewMode.Create;
  }

  public getViewMode() {
    return this.viewMode;
  }

  public setViewMode(mode: ViewMode | undefined) {
    this.currentViewMode = mode;
  }

  @Widget.Reactive()
  @Widget.Inject('submitType')
  protected parentSubmitType: SubmitType | undefined;

  @Widget.Reactive()
  protected currentSubmitType: SubmitType | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get submitType(): SubmitType {
    return (
      this.currentSubmitType ||
      (this.getDsl().submitType?.toLowerCase?.() as SubmitType) ||
      this.parentSubmitType ||
      SubmitType.default
    );
  }

  @Widget.Reactive()
  @Widget.Inject('relationUpdateType')
  protected parentRelationUpdateType: RelationUpdateType | undefined;

  @Widget.Reactive()
  protected currentRelationUpdateType: RelationUpdateType | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected get relationUpdateType(): RelationUpdateType {
    return (
      this.currentRelationUpdateType ||
      (this.getDsl().relationUpdateType?.toLowerCase?.() as RelationUpdateType) ||
      this.parentRelationUpdateType ||
      RelationUpdateType.default
    );
  }

  @Widget.Reactive()
  protected dataSourceConfig: ElementViewDataSourceConfig | undefined;

  @Widget.Reactive()
  @Widget.Inject('mountedCallChaining')
  protected parentMountedCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  protected currentMountedCallChaining: CallChaining | undefined;

  /**
   * 挂载时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get mountedCallChaining() {
    return this.currentMountedCallChaining || this.parentMountedCallChaining;
  }

  @Widget.Reactive()
  @Widget.Inject('refreshCallChaining')
  protected parentRefreshCallChaining: CallChaining<boolean> | undefined;

  @Widget.Reactive()
  protected currentRefreshCallChaining: CallChaining | undefined;

  /**
   * 刷新时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get refreshCallChaining() {
    return this.currentRefreshCallChaining || this.parentRefreshCallChaining;
  }

  @Widget.Reactive()
  @Widget.Inject('submitCallChaining')
  protected parentSubmitCallChaining: CallChaining<SubmitValue> | undefined;

  /**
   * 数据提交
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get submitCallChaining(): CallChaining<SubmitValue> | undefined {
    return this.parentSubmitCallChaining;
  }

  @Widget.Reactive()
  @Widget.Inject('validatorCallChaining')
  protected parentValidatorCallChaining: CallChaining<boolean> | undefined;

  /**
   * 数据校验
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get validatorCallChaining(): CallChaining<boolean> | undefined {
    return this.parentValidatorCallChaining;
  }

  @Widget.Reactive()
  @Widget.Inject('filter')
  protected internalFilter: string | undefined;

  @Widget.Reactive()
  @Widget.Inject('setFilter')
  protected setViewFilter: Function | undefined;

  /**
   * 自定义rsql表达式
   * @protected
   */
  @Widget.Reactive()
  protected get filter(): string | undefined {
    return this.internalFilter;
  }

  @Widget.Reactive()
  protected internalDomain: string | undefined;

  /**
   * 自定义rsql表达式
   * @protected
   */
  @Widget.Reactive()
  protected get domain(): string | undefined {
    return this.internalDomain;
  }

  protected refreshCondition() {
    const internalFilter = RSQLHelper.concatByAnd(
      this.viewAction?.filter,
      this.view?.filter,
      this.rootRuntimeContext.viewTemplate?.filter,
      this.getDsl().filter as string | undefined,
      this.metadataRuntimeContext.view.filter
    );
    this.setViewFilter?.(internalFilter);
    this.internalDomain = RSQLHelper.concatByAnd(this.viewAction?.domain, this.getDsl().domain as string | undefined);
  }

  public initialize(props: Props) {
    super.initialize(props);
    this.currentViewMode = props.viewMode;
    this.currentMountedCallChaining = props.mountedCallChaining;
    this.currentRefreshCallChaining = props.refreshCallChaining;
    const { dataSourceConfig } = parseConfigs(props, { key: 'dataSourceConfig', prefix: 'datasource' });
    this.dataSourceConfig = dataSourceConfig;
    return this;
  }

  protected isExpandView(): boolean {
    return this.metadataRuntimeContext?.childrenContext?.[0]?.handle === this.rootRuntimeContext?.parentContext?.handle;
  }

  protected abstract mountedProcess(): Promise<void>;

  protected abstract refreshProcess(): Promise<void>;

  protected $$beforeCreated() {
    super.$$beforeCreated();
    this.notify(LifeCycleTypes.ON_VIEW_BEFORE_CREATED);
  }

  protected $$created() {
    super.$$created();
    this.notify(LifeCycleTypes.ON_VIEW_CREATED);
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.$router = useRouter().router as Router;
    if (!this.currentMountedCallChaining && (!this.parentMountedCallChaining || !this.automatic)) {
      this.currentMountedCallChaining = new CallChaining();
    }
    if (!this.currentRefreshCallChaining && (!this.parentRefreshCallChaining || !this.automatic)) {
      this.currentRefreshCallChaining = new CallChaining();
    }
    this.notify(LifeCycleTypes.ON_VIEW_BEFORE_MOUNT);
  }

  protected $$mounted() {
    super.$$mounted();
    this.currentMountedCallChaining?.hook(
      this.path,
      async () => {
        await this.mountedProcess();
      },
      CallChaining.MAX_PRIORITY
    );
    this.parentMountedCallChaining?.hook(
      this.path,
      async () => {
        if (this.currentMountedCallChaining) {
          await this.currentMountedCallChaining.syncCall();
        } else {
          await this.mountedProcess();
        }
      },
      FETCH_DATA_WIDGET_PRIORITY
    );
    if (!this.parentMountedCallChaining || !this.automatic) {
      this.currentMountedCallChaining?.syncCall();
    }
    this.currentRefreshCallChaining?.hook(
      this.path,
      async (args, callBeforeResult) => {
        if (callBeforeResult === false) {
          return;
        }
        await this.$$executeRefreshCallChaining(args);
      },
      CallChaining.MAX_PRIORITY
    );
    this.parentRefreshCallChaining?.hook(
      this.path,
      async (args, callBeforeResult) => {
        if (callBeforeResult === false) {
          return;
        }
        if (this.currentRefreshCallChaining) {
          await this.currentRefreshCallChaining.syncCall(...(args || []));
        } else {
          await this.$$executeRefreshCallChaining(args);
        }
      },
      FETCH_DATA_WIDGET_PRIORITY
    );
    this.notify(LifeCycleTypes.ON_VIEW_MOUNTED);
  }

  protected $$beforeUpdate() {
    super.$$beforeUpdate();
    this.notify(LifeCycleTypes.ON_VIEW_BEFORE_UPDATE);
  }

  protected $$updated() {
    super.$$updated();
    this.notify(LifeCycleTypes.ON_VIEW_UPDATED);
  }

  protected $$beforeUnmount() {
    super.$$beforeUnmount();
    this.notify(LifeCycleTypes.ON_VIEW_BEFORE_UNMOUNT);
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.mountedCallChaining?.unhook(this.path);
    this.refreshCallChaining?.unhook(this.path);
    this.notify(LifeCycleTypes.ON_VIEW_UNMOUNTED);
  }

  protected async $$executeRefreshCallChaining(args: unknown[] | undefined): Promise<void> {
    await this.refreshProcess();
  }

  public notify(type: LifeCycleTypes) {
    try {
      const { view } = this;
      if (view?.name) {
        // 全局生命周期监听
        LifeCycleHeart.publish<BaseElementViewWidget>(type, `${view.name}`, this);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

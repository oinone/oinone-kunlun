import {
  getRefreshParameters,
  parseConfigs,
  RelationUpdateType,
  RuntimeContextManager,
  SubmitType,
  SubmitValue
} from '@oinone/kunlun-engine';
import { createVisibleArea, useEnv } from '@oinone/kunlun-environment';
import { ViewMode, ViewType } from '@oinone/kunlun-meta';
import { CallChaining, Constructor } from '@oinone/kunlun-shared';
import { SPI, SPIOptions, SPISingleSelector, SPITokenFactory } from '@oinone/kunlun-spi';
import { ActiveRecordsWidgetProps, InnerWidgetType, Widget } from '@oinone/kunlun-vue-widget';
import { cloneDeep } from 'lodash-es';
import { getCurrentInstance } from 'vue';
import DefaultView from '../../view/view/DefaultView.vue';
import { BaseRuntimePropertiesWidget } from '../common';
import { validatorCallChainingCallAfterFn, VIEW_WIDGET_PRIORITY } from '../constant';

/**
 * View组件注册可选项
 */
export interface BaseViewOptions extends SPIOptions {
  /**
   * 指定视图类型
   */
  type?: ViewType;
  /**
   * 指定组件名称或别称
   */
  widget?: string | string[];
}

export interface BaseViewProps extends ActiveRecordsWidgetProps {
  metadataHandle: string;
  inline?: boolean;
  type: ViewType;
}

export interface ViewDataSourceConfig extends Record<string, unknown> {
  /**
   * 克隆父数据源
   */
  clone?: boolean;
}

/**
 * <h3>基础视图组件</h3>
 * <p>
 * 视图组件提供了数据源和根数据属性，以及视图渲染必备的运行时模型和视图类型相关属性。
 * 视图组件也是隔离元数据和数据源的基本组件，任何数据都不应直接保留在组件内部，而是应将其提交给视图组件，以此来达到数据一致且共享的目的。
 * </p>
 * - 数据源: 当上级提供数据源时，组件不应在使用任何方式获取数据，应直接使用。
 * 当上级未提供数据源时，各个组件应通过挂载时钩子按照优先级依次获取数据源。
 * 当任何一个组件获取有效数据源（isNotNil）时，应将其提交至视图组件中进行保留；此时，其他组件不应再继续获取数据源。
 * - 根数据: 根数据会依据视图类型（Object/List）以及是否内联的标记进行自动填充，原则上不应做任何干预。
 * <br>
 * <h3>CallChaining</h3>
 * <p>
 * 在CallChaining的使用上，视图组件向下提供两种钩子。
 * </p>
 * - 挂载时 mountedCallChaining
 * - 刷新时 refreshCallChaining
 */
@SPI.Base('BaseView', ['type', 'widget'])
export abstract class BaseView<Props extends BaseViewProps = BaseViewProps> extends BaseRuntimePropertiesWidget<Props> {
  protected $$innerWidgetType = InnerWidgetType.View;

  public static Token: SPITokenFactory<BaseViewOptions>;

  public static Selector: SPISingleSelector<BaseViewOptions, Constructor<BaseView>>;

  protected defaultAllInvisible = true;

  @Widget.Reactive()
  @Widget.Provide()
  protected viewType: ViewType | undefined;

  /**
   * 父视图模式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Inject('viewMode')
  protected parentViewMode: ViewMode | undefined;

  /**
   * 当前视图模式
   * @protected
   */
  @Widget.Reactive()
  protected currentViewMode: ViewMode | undefined;

  /**
   * 当前视图模式
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  protected get viewMode(): ViewMode {
    return (
      this.currentViewMode ||
      (this.getDsl().mode?.toUpperCase() as ViewMode) ||
      this.metadataRuntimeContext.viewAction?.resViewMode ||
      this.parentViewMode ||
      ViewMode.Create
    );
  }

  public getViewMode() {
    return this.viewMode;
  }

  public setViewMode(mode: ViewMode | undefined) {
    this.currentViewMode = mode;
  }

  @Widget.Reactive()
  @Widget.Provide()
  protected filter: string | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected setFilter(filter: string | undefined) {
    this.filter = filter;
  }

  @Widget.Reactive()
  @Widget.Inject('submitType')
  protected parentSubmitType: SubmitType | undefined;

  @Widget.Reactive()
  protected currentSubmitType: SubmitType | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get submitType(): SubmitType {
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
  public get relationUpdateType(): RelationUpdateType {
    return (
      this.currentRelationUpdateType ||
      (this.getDsl().relationUpdateType?.toLowerCase?.() as RelationUpdateType) ||
      this.parentRelationUpdateType ||
      RelationUpdateType.default
    );
  }

  @Widget.Reactive()
  protected dataSourceConfig: ViewDataSourceConfig | undefined;

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
  public get mountedCallChaining(): CallChaining | undefined {
    return this.currentMountedCallChaining || this.parentMountedCallChaining;
  }

  @Widget.Reactive()
  @Widget.Inject('refreshCallChaining')
  protected parentRefreshCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  protected currentRefreshCallChaining: CallChaining | undefined;

  /**
   * 刷新时
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  public get refreshCallChaining(): CallChaining | undefined {
    return this.currentRefreshCallChaining || this.parentRefreshCallChaining;
  }

  @Widget.Reactive()
  @Widget.Inject('submitCallChaining')
  protected parentSubmitCallChaining: CallChaining<SubmitValue> | undefined;

  @Widget.Reactive()
  protected currentSubmitCallChaining: CallChaining<SubmitValue> | undefined;

  /**
   * 数据提交
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  public get submitCallChaining(): CallChaining<SubmitValue> | undefined {
    return this.currentSubmitCallChaining || this.parentSubmitCallChaining;
  }

  @Widget.Reactive()
  @Widget.Inject('validatorCallChaining')
  protected parentValidatorCallChaining: CallChaining<boolean> | undefined;

  @Widget.Reactive()
  protected currentValidatorCallChaining: CallChaining<boolean> | undefined;

  /**
   * 数据校验
   * @protected
   */
  @Widget.Reactive()
  @Widget.Provide()
  public get validatorCallChaining(): CallChaining<boolean> | undefined {
    return this.currentValidatorCallChaining || this.parentValidatorCallChaining;
  }

  public initialize(props: Props) {
    super.initialize(props);
    this.setComponent(DefaultView);
    this.viewType = props.type?.toUpperCase() as ViewType;
    if (!this.metadataHandle) {
      console.warn('metadataHandle was missing');
    }
    const { dataSourceConfig } = parseConfigs(props, { key: 'dataSourceConfig', prefix: 'datasource' });
    this.dataSourceConfig = dataSourceConfig;
    return this;
  }

  protected cloneParentDataSource() {
    this.setCurrentDataSource(cloneDeep(this.parentDataSource));
  }

  protected addVisibleArea() {
    const el = getCurrentInstance()?.vnode.el as HTMLElement;
    if (!el) {
      return;
    }
    const { currentHandle } = this;
    const env = useEnv();
    env.visibleArea.set(currentHandle, createVisibleArea(currentHandle, el));
  }

  protected clearVisibleArea() {
    const currentInstance = getCurrentInstance();
    if (!currentInstance) {
      return;
    }
    const { currentHandle } = this;
    const env = useEnv();
    env.visibleArea.delete(currentHandle);
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    this.currentMountedCallChaining = new CallChaining();
    this.currentRefreshCallChaining = new CallChaining();
    this.currentSubmitCallChaining = new CallChaining();
    this.currentValidatorCallChaining = new CallChaining();
    if (this.dataSourceConfig?.clone) {
      this.cloneParentDataSource();
    }
  }

  protected $$mounted() {
    super.$$mounted();
    if (this.automatic && this.parentMountedCallChaining && this.currentMountedCallChaining) {
      this.parentMountedCallChaining.hook(
        this.path,
        async (args) => {
          await this.currentMountedCallChaining?.syncCall(...(args || []));
        },
        VIEW_WIDGET_PRIORITY
      );
    } else {
      this.currentMountedCallChaining?.syncCall();
    }
    if (this.parentRefreshCallChaining && this.currentRefreshCallChaining) {
      let isRefreshParent = false;
      this.currentRefreshCallChaining.callBefore(
        (...args) => {
          const { refreshParent } = getRefreshParameters(args);
          if (refreshParent) {
            isRefreshParent = true;
            this.parentRefreshCallChaining?.syncCall(...(args || []));
            return false;
          }
          return true;
        },
        { immutable: true }
      );
      this.parentRefreshCallChaining.hook(
        this.path,
        async (args, callBeforeResult) => {
          if (callBeforeResult === false) {
            return;
          }
          const refreshParameters = getRefreshParameters(args);
          if (isRefreshParent) {
            isRefreshParent = false;
            refreshParameters.refreshParent = false;
          }
          await this.currentRefreshCallChaining?.syncCall(refreshParameters, ...((args || []).slice(1) || []));
        },
        VIEW_WIDGET_PRIORITY
      );
    }
    if (this.parentSubmitCallChaining && this.currentSubmitCallChaining) {
      this.parentSubmitCallChaining.hook(
        this.path,
        (args) => {
          return this.currentSubmitCallChaining?.syncCall(...(args || []));
        },
        VIEW_WIDGET_PRIORITY
      );
    }
    this.currentValidatorCallChaining?.callAfter(validatorCallChainingCallAfterFn);
    if (this.parentValidatorCallChaining && this.currentValidatorCallChaining) {
      this.parentValidatorCallChaining.hook(
        this.path,
        (args) => {
          return this.currentValidatorCallChaining?.call(...(args || []));
        },
        VIEW_WIDGET_PRIORITY
      );
    }
    this.addVisibleArea();
  }

  protected $$unmounted() {
    super.$$unmounted();
    this.parentMountedCallChaining?.unhook(this.path);
    this.parentRefreshCallChaining?.unhook(this.path);
    this.parentSubmitCallChaining?.unhook(this.path);
    this.parentValidatorCallChaining?.unhook(this.path);
    this.clearVisibleArea();
  }

  protected $$unmountedAfterProperties() {
    super.$$unmountedAfterProperties();
    RuntimeContextManager.delete(this.currentHandle);
  }

  protected $$activated() {
    super.$$activated();
    this.addVisibleArea();
  }

  protected $$deactivated() {
    super.$$deactivated();
    this.clearVisibleArea();
  }
}

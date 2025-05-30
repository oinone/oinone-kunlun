import { DslDefinition } from '@kunlun/dsl';
import {
  RuntimeContext,
  RuntimeContextManager,
  RuntimeModelField,
  RuntimeView,
  RuntimeViewAction,
  WidgetConstructor,
  WidgetProps
} from '@kunlun/engine';
import { ViewType } from '@kunlun/meta';
import { ActiveRecordsWidget, Widget } from '@kunlun/vue-widget';
import {
  createRuntimeContextByFieldSubview,
  createRuntimeContextByView,
  createRuntimeContextByViewAction
} from '../../tags/context';
import MetadataView from './MetadataView.vue';
import type { MetadataViewWidgetProps } from './MetadataViewWidget';

export class MetadataViewWithActiveRecordsWidget<
  Props extends MetadataViewWidgetProps = MetadataViewWidgetProps
> extends ActiveRecordsWidget<Props> {
  private viewAction: RuntimeViewAction | undefined;

  protected runtimeContext: RuntimeContext | undefined;

  @Widget.Reactive()
  protected isVirtual = false;

  @Widget.Reactive()
  protected inline = false;

  @Widget.Reactive()
  protected viewType: ViewType | undefined;

  @Widget.Reactive()
  protected modelModel: string | undefined;

  @Widget.Reactive()
  protected modelName: string | undefined;

  @Widget.Reactive()
  protected moduleModule: string | undefined;

  @Widget.Reactive()
  protected moduleName: string | undefined;

  @Widget.Reactive()
  protected viewLayout: DslDefinition | undefined;

  @Widget.Reactive()
  protected viewDsl: DslDefinition | undefined;

  @Widget.Reactive()
  protected viewTemplate: DslDefinition | undefined;

  public initialize(props: Props) {
    this.isVirtual = props.isVirtual || false;
    if (this.isVirtual) {
      props.slotNames = [];
    }
    super.initialize(props);
    this.setComponent(MetadataView);
    this.viewAction = props.viewAction;
    this.inline = props.inline || false;
    return this;
  }

  /**
   * 使用指定运行时上下文进行上下文初始化
   * @param runtimeContext 指定运行时上下文
   */
  public initContext(runtimeContext: RuntimeContext): RuntimeContext {
    this.viewAction = runtimeContext.viewAction;
    this.runtimeContext = runtimeContext;
    const { viewLayout, viewDsl, viewTemplate } = runtimeContext;
    const { type, model, modelName, module, moduleName } = runtimeContext.view;
    this.viewType = type;
    this.modelModel = model;
    this.modelName = modelName;
    this.moduleModule = module;
    this.moduleName = moduleName;
    this.viewLayout = viewLayout;
    this.viewDsl = viewDsl;
    this.viewTemplate = viewTemplate;
    return this.runtimeContext;
  }

  /**
   * 使用指定跳转动作进行上下文初始化
   * @param viewAction 指定跳转动作，默认使用当前视图动作
   */
  public initContextByViewAction(viewAction?: RuntimeViewAction): RuntimeContext {
    const finalViewAction = viewAction || this.viewAction;
    if (!finalViewAction) {
      throw new Error('Invalid view action define.');
    }
    const runtimeContext = createRuntimeContextByViewAction(
      finalViewAction,
      this.inline,
      this.currentHandle,
      this.rootHandle
    );
    if (!runtimeContext) {
      throw new Error('Invalid runtime context.');
    }
    this.initContext(runtimeContext);
    return runtimeContext;
  }

  /**
   * 使用指定视图进行上下文初始化
   * @param view 指定视图
   */
  public initContextByView(view: RuntimeView) {
    if (!view) {
      throw new Error('Invalid view define');
    }
    const runtimeContext = createRuntimeContextByView(view, this.inline, this.currentHandle, this.rootHandle);
    this.initContext(runtimeContext);
    return runtimeContext;
  }

  /**
   * 使用指定视图和字段进行上下文初始化
   * @param view 指定视图
   * @param field 指定字段
   */
  public initContextByViewForField(view: RuntimeView, field: RuntimeModelField) {
    if (!view) {
      throw new Error('Invalid view define');
    }
    if (!field) {
      throw new Error('Invalid field define');
    }
    const runtimeContext = createRuntimeContextByFieldSubview(
      view,
      field,
      this.inline,
      this.currentHandle,
      this.rootHandle
    );
    this.initContext(runtimeContext);
    return runtimeContext;
  }

  public createWidget<TProps extends WidgetProps, T extends Widget<TProps>>(
    constructor: WidgetConstructor<TProps, T>,
    slotName?: string,
    initConfig: T['config'] = {} as any,
    specifiedIndex?: number,
    resolveNewCode = false
  ): T {
    const automatic = initConfig.automatic;
    if (!automatic) {
      return super.createWidget(
        constructor,
        slotName,
        {
          ...initConfig,
          metadataHandle: this.currentHandle,
          rootHandle: this.currentHandle
        },
        specifiedIndex,
        resolveNewCode
      );
    }
    return super.createWidget(constructor, slotName, initConfig, specifiedIndex, resolveNewCode);
  }

  protected $$unmountedAfterProperties() {
    super.$$unmountedAfterProperties();
    RuntimeContextManager.delete(this.currentHandle);
  }
}

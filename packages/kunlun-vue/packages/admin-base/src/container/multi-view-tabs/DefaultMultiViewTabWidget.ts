import { ActiveRecord, ActiveRecords, RuntimeContext, RuntimeView, ViewCache } from '@oinone/kunlun-engine';
import { CallChaining, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { Slots, VNode } from 'vue';
import { BasePackWidget, MetadataViewWidget } from '../../basic';
import { DefaultTabWidget } from '../tabs';
import DefaultMultiViewTab from './DefaultMultiViewTab.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'MultiViewTab' }))
export class DefaultMultiViewTabWidget extends DefaultTabWidget {
  @Widget.Reactive()
  protected metadataViewWidget: MetadataViewWidget | undefined;

  protected runtimeViewContext: RuntimeContext | undefined;

  protected runtimeView: RuntimeView | undefined;

  @Widget.Reactive()
  public get invisible(): boolean {
    return false;
  }

  @Widget.Reactive()
  public get allInvisible(): boolean | undefined {
    return false;
  }

  @Widget.Reactive()
  public get forceRender() {
    return false;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultMultiViewTab);
    this.metadataViewWidget = this.createMetadataViewWidget();
    this.initView();
    return this;
  }

  @Widget.Reactive()
  public get viewModel(): string | undefined {
    return this.getDsl().viewModel;
  }

  @Widget.Reactive()
  public get viewName(): string | undefined {
    return this.getDsl().viewName;
  }

  @Widget.Reactive()
  public get currentTabKey() {
    return this.viewName || this.currentHandle;
  }

  protected async initView() {
    const view = await ViewCache.get(this.viewModel!, this.viewName!);
    if (!view) {
      throw new Error('Invalid runtime view.');
    }
    this.runtimeView = view;
    this.runtimeViewContext = this.initRuntimeContext(this.metadataViewWidget!, view);
    this.initViewAfterProperties();
  }

  protected createMetadataViewWidget(): MetadataViewWidget {
    const handle = uniqueKeyGenerator();
    return this.createWidget(new MetadataViewWidget(handle), undefined, {
      metadataHandle: this.metadataHandle,
      rootHandle: this.rootHandle,
      automatic: true,
      internal: true,
      inline: true
    });
  }

  protected initRuntimeContext(metadataSubviewWidget: MetadataViewWidget, view: RuntimeView): RuntimeContext {
    return metadataSubviewWidget.initContextByView(view);
  }

  protected initViewAfterProperties() {}

  public render(ctx?: Record<string, unknown>, slots?: Slots): VNode | VNode[] {
    return super.render(ctx, {
      default: () => {
        const vnode = this.metadataViewWidget?.render(ctx, slots);
        if (!vnode) {
          return [];
        }
        if (Array.isArray(vnode)) {
          return vnode;
        }
        return [vnode];
      }
    });
  }

  // region 生命周期钩子和数据源隔离

  @Widget.Reactive()
  @Widget.Provide()
  protected mountedCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected refreshCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected submitCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  protected validatorCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Provide()
  public get dataSource(): ActiveRecord[] | undefined {
    return this.getCurrentDataSource() || undefined;
  }

  public set dataSource(dataSource: ActiveRecord[] | undefined) {
    this.setCurrentDataSource(dataSource);
  }

  public reloadDataSource(records: ActiveRecords | undefined) {
    this.setCurrentDataSource(records);
  }

  @Widget.Reactive()
  @Widget.Provide()
  public get activeRecords(): ActiveRecord[] | undefined {
    return this.getCurrentActiveRecords() || undefined;
  }

  public set activeRecords(activeRecords: ActiveRecord[] | undefined) {
    this.setCurrentActiveRecords(activeRecords);
  }

  public reloadActiveRecords(records: ActiveRecords | undefined) {
    this.setCurrentActiveRecords(records);
  }

  // endregion
}

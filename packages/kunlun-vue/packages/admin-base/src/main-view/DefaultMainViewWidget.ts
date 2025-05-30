import {
  getReloadMainViewParameters,
  MultiTabsRuntimeManifestMergedConfigManager,
  MultiTabsManager,
  RuntimeContextManager,
  systemMajorConfig
} from '@kunlun/engine';
import { useMatched } from '@kunlun/router';
import { CallChaining } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { MaskWidget } from '@kunlun/vue-admin-layout';
import { VueWidget, Widget } from '@kunlun/vue-widget';
import { MetadataViewWidget, UrlQueryParameters } from '../basic';
import { TeleportWidget } from '../components/teleport';
import { useInjectMetaContext } from '../tags';
import DefaultMainView from './DefaultMainView.vue';
import { MultiTabsContainerWidget } from './multi-tabs';
import { MULTI_TABS_TELEPORT_HANDLE } from './multi-tabs/named';
import TeleportTargetMainView from './TeleportTargetMainView.vue';

const HOOK_PATH = '__main_view__';

let multiTabsCount = 0;

function generatorTeleportTarget(): string {
  return `multi-tabs-${multiTabsCount++}`;
}

/**
 * <h3>主视图组件</h3>
 * <p>
 * 主视图组件不提供新的运行时上下文，而是将MetadataMainView组件提供的上下文向下传递，并实现了主视图的局部更新
 * parentHandle将从这里向下提供，其他handle将维持MetadataMainView不变
 * </p>
 * <p>
 * 原则上，我们不建议你对该视图组件进行改写或添加其他任何逻辑
 * 因为，它仅仅是一个运行时上下文的初始化组件，你所有的逻辑都应在主视图内进行处理，包括但不限于数据、行为等功能的提供和获取
 * </p>
 * <p>PS: 此处Token继续使用ViewWidget，为了兼容mask的处理逻辑</p>
 */
@SPI.ClassFactory(MaskWidget.Token({ widget: 'main-view' }))
export class DefaultMainViewWidget extends MetadataViewWidget {
  @Widget.Reactive()
  @Widget.Inject()
  protected reloadMainViewCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Inject('mainViewLoading')
  protected loading: boolean | undefined;

  protected multiTabsTeleportWidget: TeleportWidget | undefined;

  protected multiTabsContainerWidget: MultiTabsContainerWidget | undefined;

  @Widget.Reactive()
  protected teleportTarget: string | undefined;

  public initialize(props) {
    super.initialize(props);
    const { module } = this.getUrlParameters();
    if (MultiTabsRuntimeManifestMergedConfigManager.isEnabled(module)) {
      this.setComponent(TeleportTargetMainView);
      this.teleportTarget = generatorTeleportTarget();
    } else {
      this.setComponent(DefaultMainView);
    }
    return this;
  }

  protected getMultiTabsTeleportWidget(): TeleportWidget | undefined {
    const teleportWidget: TeleportWidget | undefined = (
      Widget.select(MULTI_TABS_TELEPORT_HANDLE) as VueWidget
    )?.getOperator<TeleportWidget>();
    if (teleportWidget) {
      teleportWidget.setTeleport(`#${this.teleportTarget}`);
    }
    return teleportWidget;
  }

  protected reloadRuntimeContext(handle: string) {
    const runtimeContext = RuntimeContextManager.get(handle);
    if (runtimeContext) {
      this.initContext(runtimeContext);
    }
  }

  /**
   * 获取url参数
   */
  public getUrlParameters(): UrlQueryParameters {
    const { page = {} } = useMatched().matched.segmentParams;
    return page;
  }

  protected $$created() {
    super.$$created();
    const metaContext = useInjectMetaContext();
    if (!this.metadataHandle) {
      this.metadataHandle = metaContext.metadataHandle.value;
    }
    if (!this.rootHandle) {
      this.rootHandle = metaContext.rootHandle.value;
    }
    if (this.teleportTarget) {
      this.multiTabsTeleportWidget = this.getMultiTabsTeleportWidget();
    }
  }

  protected $$mounted() {
    super.$$mounted();
    if (!this.multiTabsContainerWidget) {
      this.reloadMainViewCallChaining?.hook(
        HOOK_PATH,
        (args) => {
          const reloadParameters = getReloadMainViewParameters(args);
          const handle = reloadParameters.handle;
          if (handle) {
            this.reloadRuntimeContext(handle as string);
          }
          return handle;
        },
        CallChaining.MAX_PRIORITY
      );
    }
    this.multiTabsTeleportWidget?.enable();
    MultiTabsManager.INSTANCE.enabledKeepAlive();
  }

  protected $$unmounted() {
    super.$$unmounted();
    if (!this.multiTabsContainerWidget) {
      this.reloadMainViewCallChaining?.unhook(HOOK_PATH);
    }
  }

  public dispose() {
    super.dispose();
    this.multiTabsTeleportWidget?.disable();
    MultiTabsManager.INSTANCE.disabledKeepAlive();
  }
}

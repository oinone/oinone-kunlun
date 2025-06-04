import { getReloadMainViewParameters, RuntimeContextManager } from '@oinone/kunlun-engine';
import { CallChaining } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { MetadataViewWidget, UrlQueryParameters } from '../basic';
import DefaultMainView from './DefaultMainView.vue';
import { MobileMaskWidget, MobileViewWidget } from '../layout';
import { useInjectMetaContext } from '../tags';
import { useMatched } from '@oinone/kunlun-router';
const HOOK_PATH = '__main_view__';

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
@SPI.ClassFactory(
  MobileMaskWidget.Token({
    widget: 'main-view'
  })
)
export class DefaultMainViewWidget extends MetadataViewWidget {
  @Widget.Reactive()
  @Widget.Inject()
  protected reloadMainViewCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  @Widget.Inject('mainViewLoading')
  protected loading: boolean | undefined;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultMainView);
    return this;
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
  }

  protected $$mounted() {
    super.$$mounted();

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

    this.reloadMainViewCallChaining?.callBefore(
      (handle) => {
        if (handle) {
          this.reloadRuntimeContext(handle as string);
        }
        return handle;
      },
      { force: true }
    );
  }

  protected $$unmounted() {
    super.$$unmounted();
  }
}

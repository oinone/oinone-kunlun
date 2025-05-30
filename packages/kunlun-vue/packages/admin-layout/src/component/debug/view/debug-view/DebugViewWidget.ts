import {
  ModuleCache,
  RuntimeContext,
  RuntimeContextManager,
  RuntimeContextServiceToken,
  RuntimeModule,
  RuntimeViewAction,
  ViewActionCache,
  ViewActionQueryParameter
} from '@kunlun/engine';
import { useSessionPath } from '@kunlun/request';
import { Router } from '@kunlun/router';
import { TreeNode, uniqueKeyGenerator } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { VueWidget, Widget } from '@kunlun/vue-widget';
import { MenuService } from '../../../../service';
import { RuntimeMenu } from '../../../../typing';
import { DebugErrorPanel } from '../../typing';
import { DebugUtils } from '../debug-utils';
import { DebugRuntimeContextServiceToken } from '../service/DebugRuntimeContextService';
import { DebugInfoStorage } from '../storage';
import DebugView from './DebugView.vue';

export class DebugViewWidget extends VueWidget {
  protected router!: Router;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DebugView);
    return this;
  }

  @Widget.Inject()
  @Widget.Reactive()
  protected activeDebugTab?: string;

  @Widget.Reactive()
  private pageParameters: ViewActionQueryParameter | null | undefined;

  @Widget.Reactive()
  private viewAction: RuntimeViewAction | null | undefined;

  @Widget.Reactive()
  private module: RuntimeModule | null | undefined;

  @Widget.Reactive()
  private menus: TreeNode<RuntimeMenu>[] | null | undefined;

  @Widget.Reactive()
  private runtimeContextPanels: DebugErrorPanel[] | undefined;

  private runtimeContext: RuntimeContext | undefined;

  @Widget.Method()
  public async onRefresh() {
    const page = DebugUtils.getPageParameters();
    if (!page) {
      this.pageParameters = null;
      this.viewAction = null;
      return;
    }
    this.pageParameters = page;
    DebugUtils.getDebugStorage().pageParameters = page;
    await this.resolvePageParameters(page);
  }

  protected async resolveViewAction(page: ViewActionQueryParameter): Promise<boolean> {
    const { model, action, path } = page;
    if (!model || !action) {
      return false;
    }
    try {
      const viewAction = await useSessionPath(path, () => ViewActionCache.get(model, action, true));
      if (viewAction) {
        this.viewAction = viewAction;
        DebugUtils.getDebugStorage().viewAction = viewAction;
        this.resolveDsl(viewAction);
        return true;
      }
    } catch (e) {
      console.error('Fetch view action error.', e);
    }
    this.viewAction = null;
    return false;
  }

  protected async resolveModule(page: ViewActionQueryParameter): Promise<boolean> {
    const { module: moduleName } = page;
    if (!moduleName) {
      this.module = null;
      return false;
    }
    const module = await ModuleCache.get(moduleName);
    if (module) {
      this.module = module;
      return true;
    }
    this.module = null;
    return false;
  }

  protected async resolveMenu(page: ViewActionQueryParameter): Promise<boolean> {
    const { module: moduleName } = page;
    if (!moduleName) {
      this.menus = null;
      return false;
    }
    this.menus = MenuService.convert(await MenuService.queryMenus(moduleName));
    return true;
  }

  protected resolveDsl(viewAction: RuntimeViewAction) {
    this.runtimeContextPanels = [];
    const handle = this.runtimeContext?.handle;
    if (handle) {
      RuntimeContextManager.delete(handle);
      this.runtimeContext = undefined;
      DebugUtils.getDebugStorage().runtimeContext = undefined;
    }
    const dsl = viewAction.resView?.dsl;
    if (!dsl) {
      return;
    }
    const runtimeContext = SPI.RawInstantiate(RuntimeContextServiceToken)?.createRuntimeContextByViewAction(
      viewAction,
      false,
      uniqueKeyGenerator()
    );
    if (!runtimeContext) {
      return;
    }
    runtimeContext.deepResolve();
    DebugUtils.getDebugStorage().runtimeContext = runtimeContext;
    const panels: DebugErrorPanel[] = [];
    this.resolveRuntimeContext(panels, runtimeContext);
    this.runtimeContextPanels = panels;
  }

  protected resolveRuntimeContext(runtimeContextPanels: DebugErrorPanel[], runtimeContext: RuntimeContext) {
    const services = SPI.RawInstantiates(DebugRuntimeContextServiceToken);
    let index = 1;
    for (const service of services) {
      const panel = service.analysis(runtimeContext) as unknown as DebugErrorPanel;
      if (panel) {
        panel.key = `${index++}`;
        runtimeContextPanels.push(panel);
      }
    }
  }

  protected async resolvePageParameters(page: ViewActionQueryParameter) {
    await this.resolveViewAction(page);
    // if (!(await this.resolveViewAction(page))) {
    //   return;
    // }
    // await this.resolveModule(page);
    // await this.resolveMenu(page);
  }

  protected onStorageUpdate = async (storage: DebugInfoStorage) => {
    const that = this.getOperator<this>();
    const { pageParameters, viewAction, runtimeContext } = storage;
    that.pageParameters = pageParameters;
    that.viewAction = viewAction;
    that.runtimeContext = runtimeContext;
    if (runtimeContext) {
      const panels: DebugErrorPanel[] = [];
      that.resolveRuntimeContext(panels, runtimeContext);
      that.runtimeContextPanels = panels;
    }
  };

  protected async mounted() {
    await this.onRefresh();
    DebugUtils.getDebugStorage().onUpdate(this.onStorageUpdate.bind(this));
  }

  protected unmounted() {
    DebugUtils.getDebugStorage().clearOnUpdate(this.onStorageUpdate.bind(this));
  }
}

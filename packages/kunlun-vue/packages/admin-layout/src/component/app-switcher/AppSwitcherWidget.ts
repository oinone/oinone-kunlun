import {
  $systemMajorConfig,
  getMajorConfigByModuleModule,
  MajorConfig,
  ModuleCache,
  ReloadMaskCallChainingParameters,
  setDefaultMajorConfig,
  systemMajorConfig
} from '@oinone/kunlun-engine';
import { GlobalConfig, IModule } from '@oinone/kunlun-meta';
import { Router } from '@oinone/kunlun-router';
import { SPI } from '@oinone/kunlun-spi';
import { useRouter } from '@oinone/kunlun-vue-router';
import { Widget, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import { MaskWidget } from '../../basic';
import { ModuleService } from '../../service';
import { appFinderSymbol, MenuCollapsedSymbol } from '../../typing';
import { gotoHomepage } from '../../util/HomepageUtils';
import AppSwitcher from './AppSwitcher.vue';

@SPI.ClassFactory(
  MaskWidget.Token({
    widget: 'app-switcher'
  })
)
export class AppSwitcherWidget extends MaskWidget {
  protected router!: Router;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(AppSwitcher);
    return this;
  }

  @Widget.SubContext(appFinderSymbol)
  private reloadAppFinder$!: WidgetSubjection<boolean>;

  /**
   * 当前应用列表
   * @protected
   */
  @Widget.Reactive()
  protected apps: IModule[] | undefined;

  /**
   * 收藏应用列表
   * @protected
   */
  @Widget.Reactive()
  protected get likeApp(): IModule[] {
    return this.apps?.filter((v) => v.like).slice(0, 12) || [];
  }

  @Widget.Reactive()
  protected module: IModule | undefined;

  @Widget.Reactive()
  protected majorConfig = {} as MajorConfig;

  @Widget.Reactive()
  public logo = systemMajorConfig.logo;

  @Widget.Reactive()
  public collapsedLogo = systemMajorConfig.appSideLogo;

  @Widget.Reactive()
  protected currentPageUrl = {};

  @Widget.Reactive()
  protected collapsed = false;

  @Widget.SubContext(MenuCollapsedSymbol, false)
  protected collapsed$!: WidgetSubjection<boolean>;

  @Widget.Method()
  protected async onCollectionClick(item) {
    const module = this.apps?.find((a) => a.module === item.module);
    if (module) {
      await this.onSwitchApp(module);
    }
  }

  @Widget.Method()
  protected async onSwitchApp(app: IModule) {
    if (this.module?.module === app.module) {
      return;
    }
    const oldModule = this.module;
    this.module = app;

    const { module, name: moduleName } = app;

    const needRoute = await gotoHomepage(module, moduleName, app.urlHomePage, this.router);
    if (!needRoute) {
      this.module = oldModule;
    }
  }

  protected async initApps() {
    if (!this.apps) {
      this.apps = await ModuleService.queryApplications();
    }
  }

  protected async initCurrentModule(moduleName: string): Promise<boolean> {
    if (this.module?.name === moduleName) {
      return false;
    }
    const currentModule = this.apps!.find((v) => v.name === moduleName);
    if (currentModule == null) {
      this.module = await ModuleCache.get(moduleName);
      return true;
    }
    this.module = currentModule;
    return true;
  }

  protected reloadMaskProcess(reloadParameters: ReloadMaskCallChainingParameters) {
    const { module } = reloadParameters;
    return this.initApps().then(async () => {
      if (await this.initCurrentModule(module)) {
        this.majorConfig = await getMajorConfigByModuleModule(this.module?.module || '');
        const { loginLogo } = GlobalConfig.getConfig();
        const { loginPageLogo } = setDefaultMajorConfig(this.majorConfig, 'appSwitch');
        this.majorConfig.loginPageLogo = loginLogo || loginPageLogo;
      }
    });
  }

  protected $$mounted() {
    super.$$mounted();
    this.router = useRouter().router;
    this.collapsed$.subscribe((val) => {
      this.collapsed = val;
    });

    this.currentPageUrl = this.getUrlParameters();

    $systemMajorConfig.subscribe((config) => {
      const { logo, appSideLogo } = config;
      this.logo = logo;
      this.collapsedLogo = appSideLogo;
    });

    /**
     * 应用中心新建应用的时候，需要重新加载应用
     */
    this.reloadAppFinder$.subscribe(async () => {
      this.apps = await ModuleService.queryApplications();
    });
  }
}

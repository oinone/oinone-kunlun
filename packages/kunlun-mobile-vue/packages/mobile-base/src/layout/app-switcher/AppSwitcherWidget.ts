import { Subscription } from '@kunlun/state';
import { Router, useMatched } from '@kunlun/router';
import { IMenu, IModule, ViewActionTarget } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget, WidgetBehaviorSubjection, WidgetSubjection } from '@kunlun/vue-widget';
import { http, queryHomePageDsl } from '@kunlun/service';
import {
  getMajorConfigByModuleModule,
  MajorConfig,
  useCurrentContextService,
  useMultiTabsService
} from '@kunlun/engine';
import { useRouter } from '@kunlun/vue-router';

import {
  EXECUTE_HOME_PAGE,
  GlobalStateSubSymbol,
  IGlobalState,
  MenusCollapsedSymbol,
  MenusSubSymbol,
  SWITCH_APP_COLLECTION
} from '../type';

import AppComponent from './AppSwitcher.vue';
import { getCurrentTenant } from '../../util';
import { MobileMaskWidget } from '../basic';

const appGqlContent = `
id
homepageViewId
homePageModel
homepageViewSystemSource
displayName
name
logo
like
systemSource
module
state
application
`;

@SPI.ClassFactory(MobileMaskWidget.Token({ widget: 'mobile-app-switcher' }))
export class AppSwitcherWidget extends MobileMaskWidget {
  public initialize(props) {
    super.initialize(props);

    this.setComponent(AppComponent);
    return this;
  }

  protected router!: Router;

  protected contextSub?: Subscription;

  @Widget.Reactive()
  public module?: IModule;

  @Widget.Reactive()
  public get logo() {
    return this.majorConfig.loginPageLogo;
  }

  @Widget.Reactive()
  public get collapsedLogo() {
    return this.majorConfig.appSideLogo;
  }

  @Widget.Reactive()
  public apps: IModule[] = [];

  @Widget.Reactive()
  public collapsed = false;

  @Widget.Reactive()
  protected isMaskVisible = false;

  @Widget.Method()
  protected updateMask(value: boolean) {
    this.isMaskVisible = value;
  }

  @Widget.Reactive()
  protected majorConfig = {} as MajorConfig;

  @Widget.Reactive()
  protected likeApp: { module: string; like: boolean; logo: string; displayName: string }[] = [];

  @Widget.BehaviorSubContext(GlobalStateSubSymbol, {})
  protected globalState!: WidgetBehaviorSubjection<IGlobalState>;

  @Widget.SubContext(SWITCH_APP_COLLECTION)
  protected switchAppCollection$!: WidgetSubjection<boolean>;

  @Widget.SubContext(EXECUTE_HOME_PAGE)
  protected executeHomePage$!: WidgetSubjection<IModule>;

  @Widget.BehaviorSubContext(MenusSubSymbol)
  protected menusSub!: WidgetBehaviorSubjection<IMenu[]>;

  @Widget.BehaviorSubContext(MenusCollapsedSymbol, false)
  protected menuCollapsedSymbol!: WidgetBehaviorSubjection<boolean>;

  protected loadApps = async (): Promise<IModule[]> => {
    const body = `{
      appSwitcherModuleProxyQuery {
        queryPage(
          page: {
            currentPage: 1
            size: 100
            sort: { orders: { field: "priority", direction: ASC } }
          }
          queryWrapper: { rsql: "(1==1) and (application==true) and (state =in= ('installed', 'toupgrade'))" }
        ) {
          content {
            ${appGqlContent}
          }
          size
          totalPages
          totalElements
        }
      }
    }
    `;

    const apps = (await http.query('base', body)).data['appSwitcherModuleProxyQuery']['queryPage']['content'] || [];

    return JSON.parse(JSON.stringify(apps));
  };

  @Widget.Method()
  protected async queryLikeApp() {
    const body = `{
      appSwitcherModuleProxyQuery {
        userAppList(
          data: {
          }
        ) {
          ${appGqlContent}
        }
      }
    }
    `;

    const likeApp = (await http.query('base', body)).data['appSwitcherModuleProxyQuery'][
      'userAppList'
    ] as unknown as any[];

    this.likeApp = (likeApp || ([] as any[])).filter((a) => a.state !== 'UNINSTALLED');
  }

  protected async beforeCreated() {
    const { getCurrentContext, moduleMap } = useCurrentContextService();
    this.router = useRouter().router;

    const apps = await this.loadApps();
    const value = this.globalState.subject.getValue();
    value.modules = apps;
    this.globalState.subject.next(value);
    this.apps = apps;
    this.contextSub = getCurrentContext()
      .pluck('module')
      .subscribe(async (moduleName) => {
        if (!moduleName) {
          return;
        }
        this.module = moduleMap.get(moduleName) || null;

        this.majorConfig = await getMajorConfigByModuleModule(this.module ? this.module.module : '');

        // await initI18n(module.name);
        this.apps = apps;
      });

    this.switchAppCollection$.subscribe(this.queryLikeApp);

    this.executeHomePage$.subscribe(this.switchApp);
  }

  protected beforeUnmount() {
    this.contextSub && this.contextSub.unsubscribe();
    this.switchAppCollection$ && this.switchAppCollection$.subject.unsubscribe();
  }

  protected mounted() {
    super.mounted();
    this.menuCollapsedSymbol.subscribe((b) => {
      this.collapsed = b;
    });
  }

  @Widget.Method()
  protected onCollectionClick(item) {
    const module = this.apps.find((a) => a.module === item.module);
    if (module) {
      this.switchApp(module);
    }
  }

  @Widget.Method()
  protected async switchApp(app: IModule) {
    const { name, module } = app;

    let homePage;

    try {
      homePage = await queryHomePageDsl({ needCompileView: true, needCompileMask: true, module });
    } catch (error) {
      this.router.push({
        segments: [
          {
            path: 'unauthorized'
          }
        ]
      });

      return;
    }

    if (!homePage) {
      throw new Error(`Have not home page in ${module}`);
    }

    const { cleanTabs, initTabsFromPage } = useMultiTabsService();
    // 不能从这里触发菜单变更 需要从mainView mask渲染完成后触发
    // const { loadCurrentModule } = useCurrentContextService();
    // const data = await loadCurrentModule(name);
    // const value = this.globalState.subject.getValue();
    // value.currentModule = data;
    // this.globalState.subject.next(value);

    cleanTabs();
    initTabsFromPage({
      model: homePage.resModel,
      viewType: homePage.viewType,
      module: app.name,
      language: 'zh-CN'
    });

    const { matched } = useMatched();

    const { page = {} } = matched.segmentParams;

    const parameters: Record<string, any> = {
      target: ViewActionTarget.OpenWindow,
      module: homePage.resModuleDefinition?.name || homePage.moduleDefinition?.name,
      resModel: homePage.resModel,
      model: homePage.model || homePage.resModel,
      viewType: homePage.viewType,
      action: homePage.name,
      scene: homePage.name
    };

    if (page.language) {
      parameters.language = page.language;
    }
    const tenant = getCurrentTenant();
    if (tenant) {
      parameters.tenant = tenant;
    }

    this.menusSub.subject.next([]);

    this.updateMask(false);
    this.router.push({
      segments: [
        {
          path: 'page',
          parameters
        }
      ]
    });
  }

  @Widget.Reactive()
  protected get isLike() {
    if (!this.module || !this.likeApp) {
      return false;
    }
    return !!this.likeApp.find((a) => a.module === this.module?.module);
  }

  @Widget.Method()
  public async onSwitchLike() {
    if (this.isLike) {
      await this.onUnLikeApp(this.module?.module!);
    } else {
      await this.onLikeApp(this.module?.module!);
    }

    const findIndex = this.likeApp.findIndex((a) => a.module === this.module?.module);
    if (this.isLike) {
      this.likeApp.splice(findIndex, 1);
    } else {
      this.queryLikeApp();
    }
  }

  protected async onLikeApp(module: string) {
    const body = `mutation {
      appSwitcherModuleProxyMutation {
        like(modules: [{ module: "${module}" }]) {
          id
        }
      }
    }`;

    await http.mutate('base', body);
  }

  protected async onUnLikeApp(module: string) {
    const body = `mutation {
      appSwitcherModuleProxyMutation {
        unLike(modules: [{ module: "${module}" }]) {
          id
        }
      }
    }`;

    await http.mutate('base', body);
  }
}

import {
  ClearCache,
  executeServerAction,
  executeUrlAction,
  getDefaultBrowser,
  OioProvider,
  PamirsUser,
  ReloadMaskCallChainingParameters,
  RuntimeViewAction,
  ServerActionCache,
  translateValueByKey,
  useCurrentContextService,
  UserInfo,
  ViewActionCache
} from '@oinone/kunlun-engine';
import {
  ActionType,
  Entity,
  GlobalConfig,
  IBaseAction,
  IMenu,
  isEmptyKeObject,
  IView,
  ViewActionTarget,
  ViewType
} from '@oinone/kunlun-meta';
import { getRouterInstance, Router, subscribeRoute, useMatched } from '@oinone/kunlun-router';
import { SPI } from '@oinone/kunlun-spi';
import { Subscription } from '@oinone/kunlun-state';
import { ViewSubSymbol, Widget, WidgetBehaviorSubjection, WidgetSubjection } from '@oinone/kunlun-vue-widget';
import { isNil } from 'lodash-es';
import { callFunction, getModel } from '@oinone/kunlun-service';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { OioNotification, TreeNode } from '@oinone/kunlun-vue-ui-mobile-vant';
import { GlobalStateSubSymbol, IGlobalState, MenusSubSymbol } from '../type';
import { parseActionDomain4search } from '../utils';
import MenuComponent from './NavMenu.vue';
import { GlobalKeywordSearchSubSymbol, IKeywordSearchInfo } from '../../typing';
import { autoNoticeOuterUrl, getCurrentTenant } from '../../util';

import { MenuUrlParameters, RuntimeMenu } from '../typing';
import { MenuService } from '../service';
import { MobileMaskWidget } from '../basic';

@SPI.ClassFactory(
  MobileMaskWidget.Token({
    widget: 'nav-menu'
  })
)
export class MobileNavMenuWidget extends MobileMaskWidget {
  protected watchRoute?: Subscription;

  @Widget.Reactive()
  protected menus: RuntimeMenu[] = [];

  @Widget.Reactive()
  protected treeNodes: TreeNode<RuntimeMenu>[] = [];

  @Widget.Reactive()
  protected collapsed = false;

  @Widget.Reactive()
  protected navTitle = '';

  @Widget.Inject('mode')
  @Widget.Reactive()
  protected mode: 'horizontal' | 'inline' = 'inline';

  @Widget.Reactive()
  protected moduleName: string | undefined;

  @Widget.Reactive()
  protected get showAppSwitch() {
    return this.getDsl()['app-switcher'];
  }

  @Widget.Reactive()
  protected get showMenu() {
    return this.getDsl().menu;
  }

  @Widget.Reactive()
  protected pageUrl = {} as Record<string, string>;

  @Widget.Reactive()
  public showKeywordSearch = false;

  @Widget.Reactive()
  public get allowBack() {
    const { model, action } = this.pageUrl;
    if (this.homepageAction?.name === action && this.homepageAction?.model === model) {
      return false;
    }
    return this.pageUrl.back !== 'false';
  }

  @Widget.Method()
  public changeKeywordSearchPopup(showKeywordSearchPopup) {
    this.keywordSearch$.subject.next({ showKeywordSearchPopup });
  }

  @Widget.SubContext(GlobalKeywordSearchSubSymbol)
  protected keywordSearch$!: WidgetSubjection<IKeywordSearchInfo>;

  @Widget.SubContext(ViewSubSymbol)
  protected view$!: WidgetSubjection<IView>;

  @Widget.Reactive()
  public userInfo: UserInfo = {
    pamirsUser: { id: '', name: '' } as unknown as PamirsUser,
    actionGroups: []
  } as UserInfo;

  @Widget.BehaviorSubContext(GlobalStateSubSymbol, {})
  protected globalState!: WidgetBehaviorSubjection<IGlobalState>;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(MenuComponent);

    if (this.showAppSwitch) {
      const appSwitcher = MobileMaskWidget.Selector({ widget: 'mobile-app-switcher' });
      if (!appSwitcher) {
        console.error('appSwitcher not fund');
      } else {
        this.createWidget(appSwitcher, 'appSwitcher', {} as any, undefined, true);
      }
    }

    return this;
  }

  /**
   * 在模块发生改变时调用
   * @param moduleName 模块名称
   * @protected
   */
  protected async onModuleChange(moduleName: string) {
    if (moduleName === this.moduleName) {
      return;
    }
    this.moduleName = moduleName;

    const { menus, treeNodes } = await this.fetchMenus(moduleName);
    this.menus = menus;
    this.treeNodes = treeNodes;
  }

  /**
   * 根据模块名称获取菜单
   * @param moduleName 模块名称
   * @protected
   */
  protected async fetchMenus(
    moduleName: string
  ): Promise<{ menus: RuntimeMenu[]; treeNodes: TreeNode<RuntimeMenu>[] }> {
    const { moduleMap } = useCurrentContextService();
    const { allMenus } = moduleMap.get(moduleName) || {};
    const menus = allMenus || ((await MenuService.queryMenus(moduleName)) as RuntimeMenu[]);
    const treeNodes = MenuService.convert(menus);
    MenuService.sort(treeNodes);
    return {
      menus,
      treeNodes
    };
  }

  @Widget.Reactive()
  protected homepageAction?: RuntimeViewAction = undefined;

  public async mounted() {
    super.mounted();
    const globalState = this.globalState.subject.getValue();
    this.userInfo = globalState?.user;
    this.globalState.subscribe((a) => {
      this.userInfo = a?.user;
    });

    this.view$.subscribe((view) => {
      const { moduleDisplayName, title } = (view || {}) as any;
      const titleItemArr = [] as string[];
      // moduleDisplayName && titleItemArr.push(moduleDisplayName);
      title && titleItemArr.push(title);
      if (titleItemArr.length) {
        this.navTitle = titleItemArr.join('-');
      }
    });

    this.watchRoute = subscribeRoute(
      (route) => {
        this.pageUrl = route.segmentParams.page;
      },
      { distinct: true }
    );

    if (!this.navTitle) {
      this.navTitle = document.title;
    }

    this.keywordSearch$.subscribe(({ showKeywordSearch }) => {
      if (!isNil(showKeywordSearch)) {
        this.showKeywordSearch = showKeywordSearch!;
      }
    });

    ViewActionCache.getHomepage().then((homepage) => {
      this.homepageAction = homepage;
    });
  }

  protected async reloadMaskProcess(reloadParameters: ReloadMaskCallChainingParameters) {
    const { module, model, action, currentPage } = reloadParameters;
    let menuUrlParameters: MenuUrlParameters | undefined;
    const menu = currentPage?.menu as string;
    if (menu) {
      menuUrlParameters = JSON.parse(menu);
    }
    let isRefreshMenuUrlParameters = false;
    if (menuUrlParameters) {
      const { selectedKeys, openKeys } = menuUrlParameters;

      if (this.needUpdateKeys(selectedKeys, openKeys)) {
        this.selectKeys = selectedKeys;
        this.openKeys = openKeys;
      }
    } else {
      isRefreshMenuUrlParameters = true;
    }

    if (module === this.moduleName && !isRefreshMenuUrlParameters) {
      return;
    }

    await this.load(async () => {
      await this.onModuleChange(module);
      if (isRefreshMenuUrlParameters || !this.selectKeys?.length || !this.openKeys?.length) {
        this.refreshMenuUrlParameters(model, action);
      }
    });
  }

  protected arePropertiesEqual<T extends object>(pre: T | undefined, next: T | undefined) {
    if (pre && next) {
      return JSON.stringify(pre) === JSON.stringify(next);
    }

    return false;
  }

  protected needUpdateKeys(selectedKeys: string[], openKeys: string[]) {
    if (this.arePropertiesEqual(this.selectKeys, selectedKeys) && this.arePropertiesEqual(this.openKeys, openKeys)) {
      return false;
    }

    return true;
  }

  protected refreshMenuUrlParameters(model: string, action: string) {
    const selectedMenuItem = MenuService.findSelectedMenuItemByAction(this.treeNodes, action);
    if (!selectedMenuItem) {
      return;
    }
    const { selectedKeys, openKeys } = MenuService.generatorMenuUrlParameters(selectedMenuItem);
    this.selectKeys = selectedKeys;
    this.openKeys = openKeys;
  }

  @Widget.Method()
  protected onChangeCollapsed(collapsed: boolean) {
    this.collapsed = collapsed;
  }

  @Widget.Reactive()
  protected get currentMenuId() {
    if (this.selectKeys.length) {
      const menu = this.menus.find((m) => m.name === this.selectKeys[0]) || ({} as RuntimeMenu);
      return menu.id;
    }

    return '';
  }

  @Widget.Method()
  protected async onClick(menu: RuntimeMenu, parentMenuPath?: string[]) {
    this.openKeys = parentMenuPath || [];
    if (menu) {
      const { viewAction, serverAction, urlAction, actionType } = menu;
      if (!viewAction && !serverAction && !urlAction) {
        OioNotification.warning(translateValueByKey('请注意'), translateValueByKey('该菜单未配置页面或动作'));
        return;
      }
      if (actionType === ActionType.Server && serverAction) {
        const requestMapping = menu.mapping || {};
        const menuContext = menu.context || {};
        const requestParam = MobileNavMenuWidget.handleMenuMapping(requestMapping);
        const requestVariables = MobileNavMenuWidget.handleMenuMapping(menuContext);
        callFunction(serverAction.model, serverAction, requestParam, undefined, requestVariables, { maxDepth: 1 });
      } else if (actionType === ActionType.URL && urlAction) {
        const { url, target } = urlAction || {};
        if ([ViewActionTarget.OpenWindow, ViewActionTarget.Frame].includes(target)) {
          autoNoticeOuterUrl(url);
          return;
        }
        executeUrlAction(urlAction);
      } else if (actionType === ActionType.View && viewAction) {
        const { model, domain } = viewAction;
        const extraParam = {} as Entity;
        if (domain && viewAction.viewType === ViewType.Table) {
          const { searchBody, searchConditions } = parseActionDomain4search(await getModel(model), domain);
          if (!isEmptyKeObject(searchBody)) {
            extraParam.searchBody = encodeURIComponent(JSON.stringify(searchBody));
          }
          if (!isEmptyKeObject(searchConditions)) {
            extraParam.searchConditions = encodeURIComponent(JSON.stringify(searchConditions));
          }
        }

        const tenant = getCurrentTenant();
        if (tenant) {
          extraParam.tenant = tenant;
        }

        const viewType = viewAction.resView?.type || viewAction.viewType;
        this.selectKeys = [menu.name];
        const {
          page: { language = '' }
        } = useMatched().matched.segmentParams;

        const params = {
          path: 'page',
          extra: { preserveParameter: false },
          parameters: {
            module: viewAction.resModuleName || this.moduleName,
            model,
            viewType,
            action: viewAction.name,
            menu: JSON.stringify({ selectedKeys: this.selectKeys, openKeys: this.openKeys }),
            scene: viewAction.name,
            menuRandomKey: Date.now(),
            ...extraParam
          }
        } as any;
        if (language) {
          (params.parameters as Record<string, string>).language = language;
        }

        getRouterInstance().push({
          segments: [params]
        });
      }
    }
  }

  @Widget.Reactive()
  protected selectKeys: string[] = [];

  @Widget.Reactive()
  protected openKeys: string[] = [];

  @Widget.BehaviorSubContext(MenusSubSymbol)
  protected menusSub!: WidgetBehaviorSubjection<IMenu[]>;

  protected static handleMenuMapping(mapping: Record<string, unknown>) {
    const { page } = useMatched().matched.segmentParams;
    const paramResult = {};

    for (const key of Object.keys(mapping)) {
      paramResult[key] = Expression.run(
        {
          activeRecords: [page || {}],
          rootRecord: page || {},
          openerRecord: {},
          scene: page.scene
        } as ExpressionRunParam,
        mapping[key] as string,
        mapping[key]
      );
    }
    return paramResult;
  }

  @Widget.Method()
  public async logout() {
    const actions = [] as IBaseAction[];
    this.userInfo.actionGroups.forEach((a) => {
      actions.push(...((a as any).actions || []));
    });
    const action = actions.find((a) => a.name === 'logout');
    if (action) {
      const { model, name } = action;
      const serverAction = await ServerActionCache.get(model, name);
      if (serverAction) {
        await executeServerAction(serverAction, {});
      }
      const loginPath = GlobalConfig.getConfigByName('login') as string;
      let url = loginPath;
      if (loginPath.startsWith('/')) {
        url = loginPath.slice(1);
      }
      OioProvider.setBrowserConfig(getDefaultBrowser());
      ClearCache.clear();
      getRouterInstance().push({ segments: [{ path: url }] });
      OioProvider.refreshSystemMajorConfig();
    }
  }

  protected beforeUnmount(): void {
    this.watchRoute && this.watchRoute.unsubscribe();
  }
}

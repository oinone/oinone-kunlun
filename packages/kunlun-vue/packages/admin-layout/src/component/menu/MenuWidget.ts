import {
  $systemMajorConfig,
  executeUrlAction,
  MultiTabsRuntimeManifestMergedConfigManager,
  OioProvider,
  ReloadMaskCallChainingParameters,
  SideBarTheme,
  systemMajorConfig,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { Expression, ExpressionRunParam } from '@oinone/kunlun-expression';
import { ActionType, IServerAction, IURLAction, IViewAction, ViewActionTarget } from '@oinone/kunlun-meta';
import { Router, useMatched } from '@oinone/kunlun-router';
import { callFunction } from '@oinone/kunlun-service';
import { SPI } from '@oinone/kunlun-spi';
import { Subscription } from '@oinone/kunlun-state';
import { useRouter } from '@oinone/kunlun-vue-router';
import { OioMessage, TreeNode } from '@oinone/kunlun-vue-ui-antd';
import { Widget, WidgetBehaviorSubjection } from '@oinone/kunlun-vue-widget';
import { MaskWidget } from '../../basic';
import { MenuService } from '../../service';
import { MenuCollapsedSymbol, MenuUrlParameters, RuntimeMenu } from '../../typing';
import { maskCollapsed } from '../../util';
import DefaultMenu from './DefaultMenu.vue';

@SPI.ClassFactory(MaskWidget.Token({ widget: 'nav-menu' }))
export class MenuWidget extends MaskWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultMenu);
    return this;
  }

  protected router!: Router;

  protected $systemMajorConfig!: Subscription;

  @Widget.Reactive()
  protected menuClassList = {
    [SideBarTheme.side1]: '',
    [SideBarTheme.side2]: 'oinone-menu-theme2',
    [SideBarTheme.side3]: 'oinone-menu-theme3',
    [SideBarTheme.side4]: 'oinone-menu-theme4',
    [SideBarTheme.side5]: 'oinone-menu-theme5',
    [SideBarTheme.side6]: 'oinone-menu-theme6'
  };

  @Widget.Reactive()
  protected menuTheme = systemMajorConfig.sideBarTheme || OioProvider.getConfig().sideBarTheme!;

  @Widget.Reactive()
  protected get menuThemeClass() {
    return this.menuClassList[this.menuTheme?.theme || SideBarTheme.side1];
  }

  @Widget.Reactive()
  protected moduleName: string | undefined;

  @Widget.Reactive()
  protected mode: 'horizontal' | 'inline' = 'inline';

  @Widget.Reactive()
  protected collapsed = false;

  @Widget.BehaviorSubContext(MenuCollapsedSymbol, false)
  protected collapsed$!: WidgetBehaviorSubjection<boolean>;

  @Widget.Reactive()
  protected menus: RuntimeMenu[] = [];

  @Widget.Reactive()
  protected treeNodes: TreeNode<RuntimeMenu>[] = [];

  @Widget.Reactive()
  protected selectedKeys: string[] | undefined;

  @Widget.Reactive()
  protected openKeys: string[] | undefined;

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
    const menus = (await MenuService.queryMenus(moduleName)) as RuntimeMenu[];
    const treeNodes = MenuService.convert(menus);
    MenuService.sort(treeNodes);
    return {
      menus,
      treeNodes
    };
  }

  @Widget.Method()
  protected onOpenChange(openKeys: string[]) {
    const latestOpenKey = openKeys.find((key) => this.openKeys?.indexOf(key) === -1);
    if (this.treeNodes.findIndex((v) => v.key === latestOpenKey) === -1) {
      this.openKeys = openKeys;
    } else {
      this.openKeys = latestOpenKey ? [latestOpenKey] : [];
    }
  }

  /**
   * 当菜单折叠/展开时
   * @param collapsed
   * @protected
   */
  @Widget.Method()
  protected onCollapsedChange(collapsed: boolean) {
    this.collapsed = collapsed;
    maskCollapsed(collapsed);
    this.collapsed$.subject.next(collapsed);
  }

  /**
   * 点击菜单时
   * @param node 当前菜单项
   * @private
   */
  @Widget.Method()
  protected async onClick(node: TreeNode<RuntimeMenu>) {
    const menu = node.value;
    if (!menu) {
      return;
    }
    this.selectedKeys = [node.key];

    const { viewAction, serverAction, urlAction, actionType } = menu;
    if (!viewAction && !serverAction && !urlAction) {
      OioMessage.warning(translateValueByKey('该菜单未配置页面或动作'));
      return;
    }
    switch (actionType as ActionType) {
      case ActionType.Server:
        if (serverAction) {
          await this.executeServerAction(menu, serverAction);
        }
        break;
      case ActionType.View:
        if (viewAction) {
          this.executeViewAction(menu, viewAction);
        }
        break;
      case ActionType.URL:
        if (urlAction) {
          this.executeUrlAction(menu, urlAction);
        }
        break;
      default:
        OioMessage.error(translateValueByKey('无法识别的动作类型'));
        break;
    }
  }

  @Widget.Method()
  protected async onSelect(node: TreeNode<RuntimeMenu>) {
    const menu = node.value;
    if (!menu) {
      return;
    }
    const { openKeys } = MenuService.generatorMenuUrlParameters(node);
    this.openKeys = openKeys;

    await this.onClick(node);
  }

  protected executeViewAction(menu: RuntimeMenu, viewAction: IViewAction) {
    const { model, name, target } = viewAction;
    const viewType = viewAction.resView?.type || viewAction.viewType;
    const {
      page: { language = '' }
    } = useMatched().matched.segmentParams;
    const menuUrlParameters: MenuUrlParameters = {
      selectedKeys: this.selectedKeys || [],
      openKeys: this.openKeys || []
    };
    const moduleName = viewAction.resModuleName || this.moduleName;
    const parameters: Record<string, string | undefined> = {
      module: moduleName,
      viewType,
      model,
      action: name,
      scene: name,
      target,
      menu: JSON.stringify(menuUrlParameters)
    };
    if (MultiTabsRuntimeManifestMergedConfigManager.isEnabled(moduleName)) {
      parameters.target = ViewActionTarget.OpenWindow;
    } else {
      parameters.random = Date.now().toString();
    }
    if (language) {
      parameters.language = language;
    }
    this.router.push({
      segments: [
        {
          path: 'page',
          extra: { preserveParameter: false },
          parameters
        }
      ]
    });
  }

  protected async executeServerAction(menu: RuntimeMenu, serverAction: IServerAction) {
    const requestMapping = menu.mapping || {};
    const menuContext = menu.context || {};
    const requestParam = this.handleMenuMapping(requestMapping);
    const requestVariables = this.handleMenuMapping(menuContext);
    await callFunction(serverAction.model, serverAction, requestParam, undefined, requestVariables, { maxDepth: 1 });
  }

  protected executeUrlAction(menu: RuntimeMenu, urlAction: IURLAction) {
    executeUrlAction(urlAction);
  }

  protected handleMenuMapping(mapping: Record<string, unknown>) {
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

  private arePropertiesEqual<T extends object>(pre: T | undefined, next: T | undefined) {
    if (pre && next) {
      return JSON.stringify(pre) === JSON.stringify(next);
    }

    return false;
  }

  private needUpdateKeys(selectedKeys: string[], openKeys: string[]) {
    if (this.arePropertiesEqual(this.selectedKeys, selectedKeys) && this.arePropertiesEqual(this.openKeys, openKeys)) {
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
    this.selectedKeys = selectedKeys;
    this.openKeys = openKeys;
    // const menuUrlParameters: MenuUrlParameters = {
    //   selectedKeys: this.selectedKeys || [],
    //   openKeys: this.openKeys || []
    // };
    // this.router.push({
    //   segments: [
    //     {
    //       path: 'page',
    //       extra: { preserveParameter: true },
    //       parameters: {
    //         menu: JSON.stringify(menuUrlParameters)
    //       }
    //     }
    //   ]
    // });
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
        this.selectedKeys = selectedKeys;
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
      if (isRefreshMenuUrlParameters || !this.selectedKeys?.length || !this.openKeys?.length) {
        this.refreshMenuUrlParameters(model, action);
      }
    });
  }

  protected created(): void {
    super.created();
    this.$systemMajorConfig = $systemMajorConfig.subscribe((config) => {
      if (config.sideBarTheme) {
        this.menuTheme = config.sideBarTheme!;
      }
    });
  }

  protected mounted() {
    super.mounted();
    this.router = useRouter().router;
  }

  protected beforeUnmount(): void {
    super.beforeUnmount();

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.$systemMajorConfig && this.$systemMajorConfig.unsubscribe();
  }
}

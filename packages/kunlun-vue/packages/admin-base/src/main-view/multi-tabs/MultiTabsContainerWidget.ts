import {
  $systemMajorConfig,
  generatorViewActionQueryParameter,
  getReloadMainViewParameters,
  IMultiTabsManager,
  ModuleCache,
  MultiTabInstance,
  MultiTabsApplicationHomepageConfig,
  MultiTabsConfigManager,
  MultiTabsManager,
  MultiTabsModuleHomepageConfig,
  MultiTabStackItem,
  MultiTabType,
  ReloadMainViewCallChainingParameters,
  RuntimeContext,
  RuntimeContextManager,
  RuntimeViewAction,
  systemMajorConfig,
  ViewActionCache,
  ViewActionQueryParameter
} from '@kunlun/engine';
import { ActionType, IModule, ViewActionTarget } from '@kunlun/meta';
import { BooleanHelper, CallChaining, Consumer, Executor, Optional, TreeNode } from '@kunlun/shared';
import { Subscription } from '@kunlun/state';
import { MenuService, MenuUrlParameters, RuntimeMenu } from '@kunlun/vue-admin-layout';
import { DslDefinitionWidget, DslDefinitionWidgetProps, Widget } from '@kunlun/vue-widget';
import { isString } from 'lodash-es';
import { Component, Ref } from 'vue';
import { MultiTabContainerWidget } from './MultiTabContainerWidget';
import MultiTabsContainer from './MultiTabsContainer.vue';
import { MultiTabNamedHelper } from './named';

const HOOK_PATH = '__multi_tabs_container__';

interface MultiTabItem {
  key: string;
  enter: RuntimeViewAction;
  instance: MultiTabInstance;
  createDate?: Date;
  updateDate?: Date;
}

export interface MultiTabsContainerWidgetProps extends DslDefinitionWidgetProps {
  reloadMainViewCallChaining: CallChaining;
  loading: boolean;
}

export class MultiTabsContainerWidget extends DslDefinitionWidget<MultiTabsContainerWidgetProps> {
  protected $systemMajorConfig!: Subscription;

  @Widget.Reactive()
  protected reloadMainViewCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  protected loading = false;

  @Widget.Reactive()
  protected tabs: MultiTabItem[] = [];

  @Widget.Reactive()
  protected module: IModule | undefined;

  @Widget.Reactive()
  protected menuNodes: TreeNode<RuntimeMenu>[] = [];

  @Widget.Reactive()
  protected disabledCache = true;

  public initialize(props: MultiTabsContainerWidgetProps) {
    super.initialize(props);
    this.setComponent(MultiTabsContainer);
    this.reloadMainViewCallChaining = props.reloadMainViewCallChaining;
    this.loading = props.loading || false;
    return this;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public setLoading(loading: boolean) {
    this.loading = loading;
  }

  protected keepAliveStore: Ref<string[]> | undefined;

  protected setActiveTabComponent: ((component: Component | undefined, isKeepAlive: boolean) => void) | undefined;

  protected removeTabComponent: Consumer<string> | undefined;

  protected clearTabComponent: Executor | undefined;

  @Widget.Method()
  protected setKeepAliveStore(store: Ref<string[]>) {
    this.keepAliveStore = store;
  }

  @Widget.Method()
  protected setSetterActiveTabComponent(fn: Consumer<Component | undefined>) {
    this.setActiveTabComponent = fn;
  }

  @Widget.Method()
  protected setRemoveTabComponent(fn: Consumer<string>) {
    this.removeTabComponent = fn;
  }

  @Widget.Method()
  protected setClearTabComponent(fn: Executor) {
    this.clearTabComponent = fn;
  }

  @Widget.Reactive()
  protected multiTabConfig = systemMajorConfig.extend?.systemStyleConfig?.multiTabConfig;

  public isEnabled(module?: string): boolean {
    const enabled = this.multiTabConfig?.enabled;
    if (enabled == null) {
      return MultiTabsConfigManager.isEnabled(module);
    }
    if (enabled && module) {
      return !MultiTabsConfigManager.getFilter().includes(module);
    }
    return enabled;
  }

  @Widget.Reactive()
  public get maxCount(): number | undefined {
    return this.multiTabConfig?.maxCount ?? MultiTabsConfigManager.getMaxCount();
  }

  @Widget.Reactive()
  public get maxCacheCount(): number {
    return this.multiTabConfig?.maxCacheCount ?? MultiTabsConfigManager.getMaxCacheCount();
  }

  @Widget.Reactive()
  public get isEnabledHomepage(): boolean {
    if (this.isEnabledModuleHomepage) {
      return false;
    }

    if (BooleanHelper.toBoolean(this.multiTabConfig?.homepage)) {
      return this.multiTabConfig?.homepage as boolean;
    }

    return (
      (this.multiTabConfig?.homepage as MultiTabsApplicationHomepageConfig | undefined)?.enabled ??
      MultiTabsConfigManager.isEnabledHomepage()
    );
  }

  @Widget.Reactive()
  public get isEnabledModuleHomepage(): boolean {
    if (BooleanHelper.toBoolean(this.multiTabConfig?.moduleHomepage)) {
      return this.multiTabConfig?.enabledModuleHomepage as boolean;
    }

    return (
      (this.multiTabConfig?.moduleHomepage as MultiTabsModuleHomepageConfig | undefined)?.enabled ??
      MultiTabsConfigManager.isEnabledModuleHomepage()
    );
  }

  /**
   * 在模块发生改变时调用
   * @param moduleName 模块名称
   * @protected
   */
  protected async onModuleChange(moduleName: string) {
    if (moduleName === this.module?.name) {
      return;
    }
    if (this.isEnabledModuleHomepage) {
      MultiTabsManager.INSTANCE.reset();
    }
    this.module = await ModuleCache.get(moduleName);
    this.menuNodes = await this.fetchMenuNodes(moduleName);
  }

  /**
   * 根据模块名称获取菜单
   * @param moduleName 模块名称
   * @protected
   */
  protected async fetchMenuNodes(moduleName: string): Promise<TreeNode<RuntimeMenu>[]> {
    const menus = (await MenuService.queryMenus(moduleName)) as RuntimeMenu[];
    return MenuService.convert(menus);
  }

  /**
   * 是否初始化应用首页
   * @protected
   */
  protected get isInitApplicationHomepage() {
    return (
      this.isEnabledHomepage &&
      Optional.ofNullable((this.multiTabConfig?.homepage as MultiTabsApplicationHomepageConfig)?.auto)
        .map(BooleanHelper.toBoolean)
        .orElse(true)
    );
  }

  /**
   * 是否初始化应用首页
   * @protected
   */
  protected get isInitModuleHomepage() {
    return (
      this.isEnabledModuleHomepage &&
      Optional.ofNullable((this.multiTabConfig?.moduleHomepage as MultiTabsModuleHomepageConfig)?.auto)
        .map(BooleanHelper.toBoolean)
        .orElse(true)
    );
  }

  protected async initMultiTabs(): Promise<void> {
    // 不开启首页，如果有首页，去掉
    const homepageItem = this.tabs?.[0];
    if (
      !this.isInitApplicationHomepage &&
      !this.isInitModuleHomepage &&
      homepageItem?.instance.type === MultiTabType.HOMEPAGE
    ) {
      MultiTabsManager.INSTANCE.close(homepageItem.key);
    }

    if (homepageItem?.instance.type !== MultiTabType.HOMEPAGE) {
      if (this.isInitApplicationHomepage) {
        const homepageItem = await this.initHomepageTab();
        if (MultiTabsManager.INSTANCE.isInit || this.tabs.length > 0) {
          MultiTabsManager.INSTANCE.push(homepageItem.instance, false);
          MultiTabsManager.INSTANCE.setInit(homepageItem.instance);
        } else {
          MultiTabsManager.INSTANCE.init(homepageItem.instance);
        }
        this.tabs.unshift(homepageItem);
      } else if (this.isInitModuleHomepage) {
        const homepageItem = await this.initHomepageTab(this.module!.module);
        if (MultiTabsManager.INSTANCE.isInit || this.tabs.length > 0) {
          MultiTabsManager.INSTANCE.push(homepageItem.instance);
          MultiTabsManager.INSTANCE.setInit(homepageItem.instance);
        } else {
          MultiTabsManager.INSTANCE.init(homepageItem.instance);
        }
        this.tabs.unshift(homepageItem);
      }
    }
  }

  protected async initHomepageTab(module?: string): Promise<MultiTabItem> {
    const homepage = await ViewActionCache.getHomepage(module);
    if (!homepage) {
      throw new Error('Invalid homepage.');
    }
    return this.generatorTabItem(
      module ? MultiTabType.MODULE_HOMEPAGE : MultiTabType.HOMEPAGE,
      homepage,
      generatorViewActionQueryParameter(homepage, { usingLastedModule: false })
    );
  }

  protected async initMultiTabsByMenuParameters(
    model: string,
    name: string,
    menuParameters: MenuUrlParameters | undefined
  ): Promise<MultiTabItem | undefined> {
    const selectedMenuItem = this.findSelectedMenuItem(name, menuParameters);
    if (!selectedMenuItem) {
      return this.initModuleHomepage();
    }
    const viewAction = selectedMenuItem.value?.viewAction;
    if (
      !viewAction ||
      !viewAction.model ||
      !viewAction.name ||
      (viewAction.model === model && viewAction.name === name)
    ) {
      return undefined;
    }
    const menuViewAction = await ViewActionCache.get(viewAction.model, viewAction.name);
    if (!menuViewAction) {
      return undefined;
    }
    return this.createMultiTabByMenuViewAction(menuViewAction, selectedMenuItem, menuParameters);
  }

  protected async createMultiTabByMenuViewAction(
    action: RuntimeViewAction,
    selectedMenuItem: TreeNode<RuntimeMenu>,
    menuParameters: MenuUrlParameters | undefined
  ): Promise<MultiTabItem | undefined> {
    const { model, name } = action;
    let enterTab = this.findEnterTab(action);
    if (enterTab) {
      return undefined;
    }
    const parameters = generatorViewActionQueryParameter(action, { usingLastedModule: true });
    if (menuParameters) {
      parameters.menu = JSON.stringify(menuParameters);
    } else {
      parameters.menu = JSON.stringify(MenuService.generatorMenuUrlParameters(selectedMenuItem));
    }
    enterTab = this.generatorTabItem(await this.getMultiTabType(this.module!.module, model, name), action, parameters);
    const enterTabInstance = enterTab.instance;
    enterTabInstance.title = selectedMenuItem.value?.title;
    enterTabInstance.logoUrl = this.module?.logo;
    this.appendEnterTab(enterTab);
    return enterTab;
  }

  protected findSelectedMenuItem(
    action: string,
    menuParameters: MenuUrlParameters | undefined
  ): TreeNode<RuntimeMenu> | undefined {
    let selectedMenuItem: TreeNode<RuntimeMenu> | undefined;
    if (menuParameters) {
      const { selectedKeys } = menuParameters;
      const lastedSelectKey = selectedKeys[selectedKeys.length - 1];
      if (lastedSelectKey) {
        selectedMenuItem = MenuService.findSelectedMenuItemByKey(this.menuNodes, lastedSelectKey);
      }
    } else {
      selectedMenuItem = MenuService.findSelectedMenuItemByAction(this.menuNodes, action);
    }
    return selectedMenuItem;
  }

  protected async initModuleHomepage(): Promise<MultiTabItem | undefined> {
    const moduleModule = this.module?.module;
    if (!moduleModule) {
      return undefined;
    }
    const moduleHomepage = await ViewActionCache.getHomepage(moduleModule);
    if (!moduleHomepage) {
      console.error('Invalid module homepage.');
      return undefined;
    }
    const { model, name } = moduleHomepage;
    let enterTab = this.findEnterTab(moduleHomepage);
    if (enterTab) {
      return undefined;
    }
    enterTab = this.generatorTabItem(
      await this.getMultiTabType(moduleModule, model, name),
      moduleHomepage,
      generatorViewActionQueryParameter(moduleHomepage, { usingLastedModule: true })
    );
    const enterTabInstance = enterTab.instance;
    enterTabInstance.logoUrl = this.module?.logo;
    this.appendEnterTab(enterTab);
    return enterTab;
  }

  protected generatorTabItem(
    type: MultiTabType,
    action: RuntimeViewAction,
    parameters?: ViewActionQueryParameter
  ): MultiTabItem {
    const stack: MultiTabStackItem[] = [
      {
        action,
        parameters: parameters || generatorViewActionQueryParameter(action)
      }
    ];
    let pkString: string | undefined;
    if (parameters) {
      const pkValues = this.getPKValues(action, parameters);
      if (pkValues.length) {
        pkString = JSON.stringify(pkValues);
      }
    }
    const key = MultiTabNamedHelper.generatorNamed();
    return {
      key,
      enter: action,
      instance: {
        type,
        key,
        widget: null,
        stack,
        index: 0,
        pkString
      }
    };
  }

  /**
   * 创建标签页容器组件
   * @param instanceOrKey 实例或实例key
   * @param runtimeContext 运行时上下文
   * @protected
   */
  protected createTabContainerWidget(instanceOrKey: string | MultiTabInstance, runtimeContext: RuntimeContext) {
    let instance: MultiTabInstance | undefined;
    if (isString(instanceOrKey)) {
      instance = MultiTabsManager.INSTANCE.getTab(instanceOrKey);
    } else {
      instance = instanceOrKey;
    }
    if (!instance) {
      throw new Error('Please create a tab instance before creating a widget');
    }
    if (instance.widget) {
      throw new Error('Please destroy the widget before recreating it.');
    }
    const { handle: runtimeContextHandle } = runtimeContext;
    const widget = this.createWidget(new MultiTabContainerWidget(instance.key), undefined, {
      metadataHandle: runtimeContextHandle,
      rootHandle: runtimeContextHandle,
      automatic: true,
      internal: true,
      instance
    });
    instance.widget = widget;
    return widget;
  }

  /**
   * 通过URL参数生成选项卡
   * @param page URL参数
   * @param menuParameters 菜单URL参数
   * @protected
   */
  protected async generatorTabItemByUrl(
    page: ViewActionQueryParameter,
    menuParameters: MenuUrlParameters | undefined
  ): Promise<{ tabItem: MultiTabItem; isUsingCache: boolean } | undefined> {
    const { module, model, action, target } = page;
    if (!model || !action) {
      return undefined;
    }
    const viewAction = await ViewActionCache.get(model, action);
    if (!viewAction) {
      return undefined;
    }
    if (!target || target === ViewActionTarget.OpenWindow) {
      return this.createOrUpdateEnterTab(module, viewAction, page, menuParameters);
    }
    if (target === ViewActionTarget.Router) {
      return this.joinActiveTab(viewAction, page);
    }
  }

  /**
   * 创建或更新入口选项卡
   * @param moduleName 模块名称
   * @param viewAction 跳转动作
   * @param currentPage 当前URL参数
   * @param menuParameters 菜单URL参数
   * @protected
   */
  protected async createOrUpdateEnterTab(
    moduleName: string,
    viewAction: RuntimeViewAction,
    currentPage: ViewActionQueryParameter,
    menuParameters: MenuUrlParameters | undefined
  ) {
    const { model, name } = viewAction;
    let enterTab = this.findEnterTab(viewAction, currentPage);
    let isUsingCache = false;
    if (enterTab) {
      const currentStack = enterTab.instance.stack;
      const lastedStackItem = currentStack[currentStack.length - 1];
      const drawbackStackItem = currentStack[currentStack.length - 2];
      if (drawbackStackItem && drawbackStackItem.action.model === model && drawbackStackItem.action.name === name) {
        currentStack.pop();
        drawbackStackItem.parameters = currentPage;
      } else if (lastedStackItem.action.model === model && lastedStackItem.action.name === name) {
        lastedStackItem.parameters = currentPage;
        isUsingCache = true;
      } else if (currentStack.length > 1) {
        currentStack.splice(1, currentStack.length - 2);
        currentStack[0].parameters = currentPage;
      }
    } else {
      let type = MultiTabType.NORMAL;
      const moduleDefinition = await ModuleCache.get(moduleName);
      const moduleModule = moduleDefinition?.module;
      if (moduleModule) {
        type = await this.getMultiTabType(moduleModule, model, name);
        const moduleEnterTab = this.initEnterTab;
        if (moduleEnterTab?.instance.widget === null && moduleEnterTab?.instance?.stack?.length === 1) {
          return this.joinActiveTab(viewAction, currentPage);
        }
      }
      enterTab = this.generatorTabItem(type, viewAction, currentPage);
      const enterTabInstance = enterTab.instance;
      const selectedMenuItem = this.findSelectedMenuItem(name, menuParameters);
      if (
        selectedMenuItem &&
        selectedMenuItem.value?.actionType === ActionType.View &&
        selectedMenuItem.value?.viewAction?.name === viewAction.name
      ) {
        enterTabInstance.title = selectedMenuItem.value?.title;
      }
      if (!enterTabInstance.title) {
        enterTabInstance.title = viewAction.resView?.title;
      }
      enterTabInstance.logoUrl = moduleDefinition?.logo;
      this.appendEnterTab(enterTab, currentPage);
    }
    return {
      tabItem: enterTab,
      isUsingCache
    };
  }

  protected appendEnterTab(enterTab: MultiTabItem, parameter?: ViewActionQueryParameter) {
    if (this.findEnterTab(enterTab.enter, parameter)) {
      return undefined;
    }
    MultiTabsManager.INSTANCE.push(enterTab.instance);
    this.tabs.push(enterTab);
  }

  /**
   * 加入到当前激活的选项卡中
   * @param viewAction 跳转动作
   * @param currentPage 当前URL参数
   * @protected
   */
  protected joinActiveTab(viewAction: RuntimeViewAction, currentPage: ViewActionQueryParameter) {
    const { model, name } = viewAction;
    const activeKey = MultiTabsManager.INSTANCE.getActiveTab()?.key;
    if (!activeKey) {
      throw new Error('Invalid multi tab active key.');
    }
    const activeTab = this.tabs.find((v) => v.key === activeKey);
    if (!activeTab) {
      throw new Error('Invalid multi tab active tab.');
    }
    const currentStack = activeTab.instance.stack;
    const lastedStackItem = currentStack[currentStack.length - 1];
    const drawbackStackItem = currentStack[currentStack.length - 2];
    let isUsingCache = false;
    if (drawbackStackItem && drawbackStackItem.action.model === model && drawbackStackItem.action.name === name) {
      currentStack.pop();
      drawbackStackItem.parameters = currentPage;
    } else if (lastedStackItem.action.model === viewAction.model && lastedStackItem.action.name === viewAction.name) {
      lastedStackItem.parameters = currentPage;
      isUsingCache = true;
    } else {
      currentStack.push({
        action: viewAction,
        parameters: currentPage
      });
    }
    return {
      tabItem: activeTab,
      isUsingCache
    };
  }

  protected findEnterTab(action: RuntimeViewAction, parameter?: ViewActionQueryParameter): MultiTabItem | undefined {
    const { model, name } = action;
    if (parameter) {
      const pkValues = this.getPKValues(action, parameter);
      if (pkValues.length) {
        const pksString = JSON.stringify(pkValues);
        return this.tabs.find((tab) => {
          const { model: enterModel, name: enterName } = tab.enter;
          return enterModel === model && enterName === name && tab.instance.pkString === pksString;
        });
      }
    }
    return this.tabs.find((tab) => {
      const { model: enterModel, name: enterName } = tab.enter;
      return enterModel === model && enterName === name;
    });
  }

  protected getPKValues(action: RuntimeViewAction, parameter: ViewActionQueryParameter): string[] {
    const { target } = parameter;
    if (target === ViewActionTarget.OpenWindow) {
      return (action.resModelDefinition?.pks
        ?.map((pk) => parameter[pk])
        .filter((v) => !!v)
        .sort() || []) as string[];
    }
    return [];
  }

  protected async getMultiTabType(moduleModule: string, model: string, name: string): Promise<MultiTabType> {
    if (this.isEnabledHomepage) {
      const applicationHomepage = await ViewActionCache.getHomepage();
      if (applicationHomepage && applicationHomepage.model === model && applicationHomepage.name === name) {
        return MultiTabType.HOMEPAGE;
      }
    }
    if (this.isEnabledModuleHomepage) {
      const moduleHomepage = await ViewActionCache.getHomepage(moduleModule);
      if (moduleHomepage && moduleHomepage.model === model && moduleHomepage.name === name) {
        return MultiTabType.MODULE_HOMEPAGE;
      }
    }
    return MultiTabType.NORMAL;
  }

  protected async refreshRuntimeContext(
    handle: string,
    currentPage: ViewActionQueryParameter,
    menuUrlParameters: MenuUrlParameters | undefined
  ) {
    const runtimeContext = RuntimeContextManager.get(handle);
    if (!runtimeContext) {
      return;
    }
    let targetTabItem: MultiTabItem | undefined;
    let isActive = false;
    const res = await this.generatorTabItemByUrl(currentPage, menuUrlParameters);
    if (res) {
      const { tabItem, isUsingCache } = res;
      if (tabItem) {
        targetTabItem = tabItem;
        isActive = isUsingCache;
      }
    }

    if (!targetTabItem) {
      return;
    }

    const { instance: tabInstance } = targetTabItem;
    const widget = tabInstance.widget;
    MultiTabsManager.INSTANCE.active(tabInstance.key);
    if (!MultiTabsManager.INSTANCE.isKeepAlive) {
      return;
    }
    if (isActive) {
      if (!widget) {
        this.createTabContainerWidget(tabInstance, runtimeContext);
        targetTabItem.createDate = undefined;
        MultiTabsManager.INSTANCE.refresh(tabInstance.key, handle);
      }
    } else {
      if (!widget) {
        this.createTabContainerWidget(tabInstance, runtimeContext);
        targetTabItem.createDate = undefined;
      }
      MultiTabsManager.INSTANCE.refresh(tabInstance.key, handle);
    }
    this.setActiveTabItem(targetTabItem);
  }

  protected setActiveTabItem(tab: MultiTabItem) {
    const { widget, stack } = tab.instance;
    if (!widget) {
      throw new Error('Invalid tab widget.');
    }
    const { action } = stack[stack.length - 1];
    const isKeepAlive = (action.context?.isKeepAlive as boolean) ?? true;
    this.setActiveTabComponent?.(widget.getWidgetComponent(true) as Component, isKeepAlive);
    const now = new Date();
    if (!tab.createDate) {
      tab.createDate = now;
    }
    tab.updateDate = now;
    const { maxCount, maxCacheCount } = this;
    if (maxCount != null && maxCount > 0) {
      this.executeMaxCount(maxCount);
    }
    if (maxCacheCount != null && maxCacheCount > 0) {
      this.executeMaxCacheCount(maxCacheCount);
    }
  }

  protected executeMaxCount(maxCount: number) {
    const sortedTabs = this.getSortedTabs();
    const deleteCount = sortedTabs.length - maxCount;
    for (let i = 0; i < deleteCount; i++) {
      const targetTab = sortedTabs.find((v) => {
        return v.instance.type === MultiTabType.NORMAL;
      });
      if (!targetTab) {
        break;
      }
      this.$closeTabByAsync(targetTab);
    }
  }

  protected async $closeTabByAsync(tab: MultiTabItem) {
    MultiTabsManager.INSTANCE.close(tab.key);
  }

  protected executeMaxCacheCount(maxCacheCount: number) {
    let store = this.keepAliveStore?.value;
    if (!store) {
      return;
    }
    const sortedTabs = this.getSortedTabs();
    const deleteCount = store.filter((v) => sortedTabs.findIndex((vv) => vv.key === v) !== -1).length - maxCacheCount;
    for (let i = 0; i < deleteCount; i++) {
      const finalStore = store;
      const removeIndex = sortedTabs.findIndex((v) => {
        return v.instance.type === MultiTabType.NORMAL && finalStore.includes(v.key);
      });
      if (removeIndex === -1) {
        break;
      }
      const removeTab = sortedTabs[removeIndex];
      this.removeTabComponent?.(removeTab.key);
      store = this.keepAliveStore?.value;
      if (!store) {
        break;
      }
    }
  }

  protected getSortedTabs(): MultiTabItem[] {
    return [...this.tabs]
      .filter((v) => v.instance.type === MultiTabType.NORMAL && !!v.createDate)
      .sort((a, b) => {
        const acd = a.createDate!;
        const bcd = b.createDate!;
        if (acd === bcd) {
          return 0;
        }
        if (acd < bcd) {
          return -1;
        }
        return 1;
      });
  }

  protected initEnterTab: MultiTabItem | undefined;

  protected async reloadMainViewProcess(reloadParameters: ReloadMainViewCallChainingParameters) {
    const { handle, module, model, action, currentPage } = reloadParameters;

    if (!this.isEnabled(module)) {
      this.disabledCache = true;
      return;
    }
    this.disabledCache = false;

    await this.onModuleChange(module);

    let menuUrlParameters: MenuUrlParameters | undefined;
    if (currentPage) {
      const menu = currentPage.menu as string;
      if (menu) {
        menuUrlParameters = JSON.parse(menu);
      }
    }

    await this.initMultiTabs();
    this.initEnterTab = await this.initMultiTabsByMenuParameters(model, action, menuUrlParameters);
    try {
      await this.refreshRuntimeContext(handle, currentPage as ViewActionQueryParameter, menuUrlParameters);
    } finally {
      this.initEnterTab = undefined;
    }
  }

  protected onClose = (manager: IMultiTabsManager, instance: MultiTabInstance) => {
    const { key } = instance;
    const targetIndex = this.tabs.findIndex((v) => v.key === key);
    if (targetIndex !== -1) {
      this.tabs.splice(targetIndex, 1);
      this.removeTabComponent?.(key);
    }
  };

  protected onReset = (manager: IMultiTabsManager) => {
    this.clearTabComponent?.();
  };

  protected $$created() {
    super.$$created();
    this.$systemMajorConfig = $systemMajorConfig.subscribe((config) => {
      if (!this.multiTabConfig) {
        this.multiTabConfig = {};
      }
      if (config.multiTabTheme) {
        Object.assign(this.multiTabConfig, config.multiTabTheme);
      }
      if (config.extend?.systemStyleConfig?.multiTabConfig) {
        Object.assign(this.multiTabConfig, config.extend.systemStyleConfig.multiTabConfig);
      }
    });
  }

  protected $$mounted() {
    super.$$mounted();
    this.reloadMainViewCallChaining?.hook(
      HOOK_PATH,
      async (args) => {
        const reloadParameters = getReloadMainViewParameters(args);
        await this.reloadMainViewProcess(reloadParameters);
      },
      CallChaining.MAX_PRIORITY
    );
    MultiTabsManager.INSTANCE.onClose(this.onClose.bind(this));
    MultiTabsManager.INSTANCE.onReset(this.onReset.bind(this));
  }

  protected $$unmounted() {
    super.$$unmounted();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.$systemMajorConfig && this.$systemMajorConfig.unsubscribe();
    this.reloadMainViewCallChaining?.unhook(HOOK_PATH);
    MultiTabsManager.INSTANCE.clearOnClose(this.onClose);
    MultiTabsManager.INSTANCE.clearOnReset(this.onReset);
  }
}

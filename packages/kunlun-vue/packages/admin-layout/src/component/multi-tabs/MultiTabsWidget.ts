import {
  $systemMajorConfig,
  executeViewAction,
  IMultiTabsManager,
  MultiTabInstance,
  MultiTabsApplicationHomepageConfig,
  MultiTabsConfigManager,
  MultiTabsHelper,
  MultiTabsManager,
  MultiTabsModuleHomepageConfig,
  MultiTabsRouter,
  MultiTabsRuntimeManifestMergedConfigManager,
  MultiTabTheme,
  MultiTabType,
  RedirectTargetEnum,
  ReloadMainViewCallChainingParameters,
  systemMajorConfig,
  translateValueByKey
} from '@oinone/kunlun-engine';
import { Matched, Router, useMatched } from '@oinone/kunlun-router';
import { BooleanHelper, Optional } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { Subscription } from '@oinone/kunlun-state';
import { useRouter } from '@oinone/kunlun-vue-router';
import { Widget } from '@oinone/kunlun-vue-widget';

import { MaskWidget } from '../../basic';
import { ModuleService } from '../../service';
import MultiTabs from './MultiTabs.vue';
import { MultiTabItem } from './typing';

@SPI.ClassFactory(MaskWidget.Token({ dslNodeType: 'multi-tabs' }))
export class MultiTabsWidget extends MaskWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(MultiTabs);
    return this;
  }

  protected router!: Router;

  protected matched!: Matched;

  @Widget.Reactive()
  protected outTabClassList = {
    [MultiTabTheme.tab1]: '',
    [MultiTabTheme.tab2]: 'theme1',
    [MultiTabTheme.tab3]: 'theme2',
    [MultiTabTheme.tab4]: 'theme3'
  };

  @Widget.Reactive()
  protected internalTabClassList = {
    [MultiTabTheme.tab1]: 'theme1',
    [MultiTabTheme.tab2]: 'theme2',
    [MultiTabTheme.tab3]: 'theme3',
    [MultiTabTheme.tab4]: 'theme4'
  };

  @Widget.Reactive()
  protected multiTabConfig =
    systemMajorConfig.extend?.systemStyleConfig?.multiTabConfig ?? systemMajorConfig.multiTabTheme;

  protected $systemMajorConfig!: Subscription;

  protected isEnabled(module?: string): boolean {
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
  protected get draggable(): boolean {
    const draggable = this.multiTabConfig?.draggable;
    if (draggable == null) {
      return Optional.ofNullable(MultiTabsConfigManager.getConfig().draggable)
        .map(BooleanHelper.toBoolean)
        .orElse(true)!;
    }
    return draggable;
  }

  @Widget.Reactive()
  protected get showModuleLogo() {
    if (this.isEnabledModuleHomepage) {
      return false;
    }
    return this.multiTabConfig?.showModuleLogo ?? MultiTabsConfigManager.isShowModuleLogo();
  }

  @Widget.Reactive()
  protected get isEnabledHomepage(): boolean | undefined {
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
  protected get isEnabledModuleHomepage(): boolean {
    if (BooleanHelper.toBoolean(this.multiTabConfig?.moduleHomepage)) {
      return this.multiTabConfig?.enabledModuleHomepage as boolean;
    }

    return (
      (this.multiTabConfig?.moduleHomepage as MultiTabsModuleHomepageConfig | undefined)?.enabled ??
      MultiTabsConfigManager.isEnabledModuleHomepage()
    );
  }

  @Widget.Reactive()
  protected get tabThemeClass() {
    const { inline = false, theme = MultiTabTheme.tab1 } = this.multiTabConfig || {};

    if (inline) {
      return this.internalTabClassList[theme];
    }

    return this.outTabClassList[theme];
  }

  @Widget.Reactive()
  protected homepageTab: MultiTabItem | null | undefined;

  @Widget.Reactive()
  protected tabs: MultiTabItem[] = [];

  @Widget.Reactive()
  protected activeKey: string | undefined;

  @Widget.Reactive()
  protected invisible = false;

  protected getTabs() {
    // 防止onClose、onActive的回调内拿不到vue的响应式变量值
    return this.getOperator<this>().tabs;
  }

  @Widget.Reactive()
  protected get inline() {
    const dslInline = BooleanHelper.toBoolean(this.getDsl().inline);

    if (dslInline) {
      return true;
    }

    const { inline } = this.multiTabConfig || {};
    if (inline) {
      return true;
    }

    return false;
  }

  @Widget.Method()
  protected closable(tabs: MultiTabItem[], tab: MultiTabItem, index: number): boolean {
    if (this.isEnabledHomepage || this.isEnabledModuleHomepage) {
      return tabs.length >= 2 && index !== 0;
    }
    return tabs.length >= 2;
  }

  @Widget.Method()
  protected onClickTab(tab: MultiTabItem) {
    const { key, instance } = tab;
    this.activeKey = key;
    MultiTabsManager.INSTANCE.active(key);
    MultiTabsRouter.useRouter(this.router).to(instance);
  }

  @Widget.Method()
  protected onRefreshTab(tab: MultiTabItem) {
    MultiTabsManager.INSTANCE.refresh(tab.key);
  }

  @Widget.Method()
  protected onCloseTab(tab: MultiTabItem) {
    this.consumerTargetTab(tab, (activeIndex, targetIndex) => {
      if (activeIndex === targetIndex) {
        const nextActiveTab = this.findNextActiveTab(this.getTabs(), activeIndex);
        if (nextActiveTab) {
          this.onClickTab(nextActiveTab);
        }
      }

      this.getTabs().splice(targetIndex, 1);
      if (MultiTabsManager.INSTANCE.getTab(tab.key)) {
        MultiTabsManager.INSTANCE.close(tab.key);
      }
    });
  }

  @Widget.Method()
  protected onCloseOtherTabs(tab: MultiTabItem) {
    const ignoredKeys = this.generatorCloseIgnoredKeys(tab);
    this.consumerTargetTab(tab, (activeIndex, targetIndex) => {
      this.$onCloseOtherTabs(
        tab,
        activeIndex,
        (target, index) => index !== targetIndex && !ignoredKeys.includes(target.key)
      );
    });
  }

  @Widget.Method()
  protected onCloseLeftTabs(tab: MultiTabItem) {
    const ignoredKeys = this.generatorCloseIgnoredKeys(tab);
    this.consumerTargetTab(tab, (activeIndex, targetIndex) => {
      this.$onCloseOtherTabs(
        tab,
        activeIndex,
        (target, index) => index < targetIndex && !ignoredKeys.includes(target.key)
      );
    });
  }

  @Widget.Method()
  protected onCloseRightTabs(tab: MultiTabItem) {
    const ignoredKeys = this.generatorCloseIgnoredKeys(tab);
    this.consumerTargetTab(tab, (activeIndex, targetIndex) => {
      this.$onCloseOtherTabs(
        tab,
        activeIndex,
        (target, index) => index > targetIndex && !ignoredKeys.includes(target.key)
      );
    });
  }

  protected generatorCloseIgnoredKeys(tab: MultiTabItem) {
    const ignoredKeys: string[] = [tab.key];
    const homepageKey = this.homepageTab?.key;
    if (homepageKey) {
      ignoredKeys.push(homepageKey);
    }
    return ignoredKeys;
  }

  protected $onCloseOtherTabs(
    tab: MultiTabItem,
    currentActiveIndex: number,
    filter: (tab: MultiTabItem, index: number) => boolean
  ) {
    const { activeKey } = this;
    let isClosedActiveTab = false;
    const cloneTabs = [...this.getTabs()];
    let index = 0;
    for (let i = 0; i < cloneTabs.length; i++) {
      const targetTab = cloneTabs[i];
      const { key } = targetTab;
      if (filter(targetTab, index)) {
        cloneTabs.splice(i, 1);
        i--;
        MultiTabsManager.INSTANCE.close(key);
        if (activeKey === key) {
          isClosedActiveTab = true;
        }
      }
      index++;
    }
    this.tabs = cloneTabs;
    if (isClosedActiveTab) {
      const nextActiveTab = this.findNextActiveTab(cloneTabs, currentActiveIndex);
      if (nextActiveTab) {
        this.onClickTab(nextActiveTab);
      }
    }
  }

  protected findNextActiveTab(tabs: MultiTabItem[], currentActiveIndex: number) {
    let nextTab: MultiTabItem;
    if (currentActiveIndex === 0) {
      nextTab = tabs[currentActiveIndex + 1];
    } else {
      nextTab = tabs[currentActiveIndex - 1];
    }
    return nextTab;
  }

  @Widget.Method()
  protected async onOpenNewWindow(tab: MultiTabItem) {
    const currentStack = tab.instance.stack;
    const lastedStackItem = currentStack[currentStack.length - 1];
    executeViewAction(
      lastedStackItem.action,
      this.router,
      this.matched,
      await MultiTabsHelper.generatorParameters(lastedStackItem),
      RedirectTargetEnum.BLANK
    );
  }

  @Widget.Method()
  protected onMoveToSelfCallback(dragTab: MultiTabItem, targetTab: MultiTabItem): boolean {
    const targetTabType = targetTab.instance.type;
    return targetTabType == null || targetTabType === MultiTabType.NORMAL;
  }

  @Widget.Method()
  protected onMovedCallback(tab: MultiTabItem) {
    const sortKeys: string[] = [];
    if (this.homepageTab) {
      sortKeys.push(this.homepageTab.key);
    }
    this.getTabs().forEach((v) => {
      sortKeys.push(v.key);
    });
    MultiTabsManager.INSTANCE.setSortKeys(sortKeys);
  }

  protected consumerTargetTab(tab: MultiTabItem, fn: (activeIndex: number, targetIndex: number) => void) {
    const { activeKey } = this;
    const activeIndex = this.getTabs().findIndex((v) => v.key === activeKey);
    const targetKey = tab.key;
    const targetIndex = this.getTabs().findIndex((v) => v.key === targetKey);
    fn(activeIndex, targetIndex);
  }

  @Widget.Reactive()
  protected get homepageType(): MultiTabType | undefined {
    if (this.isEnabledHomepage) {
      return MultiTabType.HOMEPAGE;
    }
    if (this.isEnabledModuleHomepage) {
      return MultiTabType.MODULE_HOMEPAGE;
    }
  }

  protected async reloadTabs(): Promise<void> {
    const currentTabs = MultiTabsManager.INSTANCE.getTabs();
    const tabs: MultiTabItem[] = [];
    let usingHomepage = false;
    const { homepageType } = this;
    for (const currentTab of currentTabs) {
      const { type, key } = currentTab;
      const tabItem = {
        key,
        title: this.generatorTabTitle(currentTab),
        instance: currentTab
      };
      if (!usingHomepage && homepageType && type === homepageType) {
        tabItem.title = translateValueByKey('首页');
        this.homepageTab = tabItem;
        usingHomepage = true;
        tabs.splice(0, 0, tabItem);
        continue;
      }
      tabs.push(tabItem);
    }
    this.tabs = tabs;
    if (!usingHomepage) {
      this.homepageTab = null;
    }
  }

  protected generatorTabTitle(tab: MultiTabInstance): string {
    const { title, stack } = tab;
    return title || ModuleService.generatorViewTitle(stack[stack.length - 1].action);
  }

  protected async reloadActiveTab(): Promise<void> {
    const activeTab = MultiTabsManager.INSTANCE.getActiveTab();
    if (!activeTab) {
      throw new Error('Invalid active tab.');
    }
    const tab = this.getTabs().find((a) => a.key === activeTab.key);
    if (tab) {
      const stackLength = activeTab.stack.length;
      tab.title =
        stackLength > 1 ? ModuleService.generatorViewTitle(activeTab.stack[stackLength - 1].action) : tab.title;
    }
    this.activeKey = activeTab.key;
    let invisible = false;
    if (activeTab.type === MultiTabType.HOMEPAGE) {
      const autoInvisible = Optional.ofNullable(
        MultiTabsRuntimeManifestMergedConfigManager.getApplicationHomepageConfig()
      )
        .map((v) => v.autoInvisible)
        .orElse(true);
      if (autoInvisible) {
        invisible = true;
      }
    }
    this.invisible = invisible;
  }

  protected async reloadMainViewProcess(reloadParameters: ReloadMainViewCallChainingParameters) {
    const { module } = reloadParameters;
    if (!this.isEnabled(module)) {
      return;
    }
    await this.reloadTabs();
    await this.reloadActiveTab();
  }

  protected onActive = (manager: IMultiTabsManager, instance: MultiTabInstance) => {
    this.activeKey = instance.key;
  };

  protected onClose = (manager: IMultiTabsManager, instance: MultiTabInstance) => {
    const { key } = instance;
    const targetTab = this.getTabs().find((v) => v.key === key);
    if (targetTab) {
      this.onCloseTab(targetTab);
    }
  };

  protected $$created(): void {
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
    this.router = useRouter().router;
    this.matched = useMatched().matched;
    MultiTabsManager.INSTANCE.onActive(this.onActive.bind(this));
    MultiTabsManager.INSTANCE.onClose(this.onClose.bind(this));
  }

  protected $$unmounted() {
    super.$$unmounted();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.$systemMajorConfig && this.$systemMajorConfig.unsubscribe();
    MultiTabsManager.INSTANCE.clearOnActive(this.onActive);
    MultiTabsManager.INSTANCE.clearOnClose(this.onClose);
  }
}

import { IMenu } from '@kunlun/meta';
import { StateStream } from '@kunlun/state';

import { Page, useCurrentContextService } from './typing';

interface TabContext {
  tabs: Tab[];
  currentTab: Tab;
}

export type Tab = IMenu;

const IS_MULTI_TABS_MODE = false;
const tabContext = new StateStream<TabContext>({ tabs: [] });
const getTabs = () => tabContext.pluck('tabs');
const getCurrentTab = () => tabContext.pluck('currentTab');

const initTabsFromPage = (page: Page) => {
  const currentTab = tabContext.getValueByKey('currentTab');
  if (currentTab) {
    return;
  }

  const { getCurrentContext, moduleMap } = useCurrentContextService();
  const moduleName = getCurrentContext().getValueByKey('module');
  const { allMenus } = moduleMap.get(moduleName) || {};
  const { viewType, model: modelModel } = page;
  const menu = allMenus?.find((m) => {
    if (!m.viewAction) {
      return false;
    }
    const { viewType: vaViewType, resModel } = m.viewAction;
    return vaViewType === viewType && resModel === modelModel;
  });
  menu && tabContext.setValues({ tabs: [menu], currentTab: menu });
};

const pushTab = (tab: Tab) => {
  const _tabs = tabContext.getValueByKey('tabs');
  if (!_tabs.find((t) => t.id === tab.id)) {
    tabContext.setValue('tabs', [..._tabs, tab]);
  }
  selectTab(tab);
};

const selectTab = (tab: Tab, callback?: Function) => {
  tabContext.setValue('currentTab', tab);
  callback && callback(tab);
};

const closeTab = (tab: Tab, callback?: Function) => {
  const _tabs = tabContext.getValueByKey('tabs');
  const currentTab = tabContext.getValueByKey('currentTab');
  tabContext.setValue(
    'tabs',
    _tabs.filter((t) => t.id !== tab.id)
  );
  if (tab.id === currentTab.id) {
    const currentTabIndex = _tabs.findIndex((t) => t.id === currentTab.id);
    if (currentTabIndex === 0) {
      selectTab(_tabs[currentTabIndex + 1], callback);
    } else {
      selectTab(_tabs[currentTabIndex - 1], callback);
    }
  }
};

const cleanTabs = () => {
  tabContext.setValue('tabs', []);
  tabContext.setValue('currentTab', null);
};

export const useMultiTabsService = () => ({
  isMultiTabsMode: () => IS_MULTI_TABS_MODE,
  getTabs,
  getCurrentTab,
  initTabsFromPage,
  pushTab,
  closeTab,
  selectTab,
  cleanTabs
});

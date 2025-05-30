import { getRouterInstance } from '@kunlun/router';
import { MultiTabsManager } from './manager';
import { MultiTabsRouter } from './router';
import { MultiTabInstance } from './typing';

export class MultiTabsManagerExtend {
  /**
   * 关闭当前标签页，并激活上一个标签页
   * @protected
   */
  public closeCurrentTab() {
    const current = MultiTabsManager.INSTANCE.getActiveTab()!;
    this.closeTab(current);
  }

  /**
   * 关闭指定标签页，并激活上一个标签页
   * @param tab 需要关闭的标签页
   * @protected
   */
  public closeTab(tab: MultiTabInstance) {
    this.consumerTargetTab(tab, (activeIndex, targetIndex) => {
      if (activeIndex === targetIndex) {
        const nextActiveTab = this.findNextActiveTab(activeIndex);
        if (nextActiveTab) {
          this.activeTabInstance(nextActiveTab);
        }
      }
    });
    MultiTabsManager.INSTANCE.close(tab.key);
  }

  public activeTabInstance(tab: MultiTabInstance) {
    MultiTabsManager.INSTANCE.active(tab.key);
    MultiTabsRouter.useRouter(getRouterInstance()).to(tab);
  }

  protected consumerTargetTab(tab: MultiTabInstance, fn: (activeIndex: number, targetIndex: number) => void) {
    const { key: activeKey } = MultiTabsManager.INSTANCE.getActiveTab()!;
    const activeIndex = MultiTabsManager.INSTANCE.getTabs().findIndex((v) => v.key === activeKey);
    const targetKey = tab.key;
    const targetIndex = MultiTabsManager.INSTANCE.getTabs().findIndex((v) => v.key === targetKey);
    fn(activeIndex, targetIndex);
  }

  protected findNextActiveTab(currentActiveIndex: number) {
    const tabs = MultiTabsManager.INSTANCE.getTabs();
    let nextTab: MultiTabInstance;
    if (currentActiveIndex === 0) {
      nextTab = tabs[currentActiveIndex + 1];
    } else {
      nextTab = tabs[currentActiveIndex - 1];
    }
    return nextTab;
  }
}

import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { BasePackWidget } from '../../basic';
import { DefaultTabsWidget } from '../tabs';
import DefaultMultiViewTabs from './DefaultMultiViewTabs.vue';
import { useMultiViewKeyCache, MultiViewKeyCache } from './useMultiViewKeyCache';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'MultiViewTabs' }))
export class DefaultMultiViewTabsWidget extends DefaultTabsWidget {
  @Widget.Reactive()
  public get invisible(): boolean {
    return false;
  }

  @Widget.Reactive()
  public get allInvisible(): boolean | undefined {
    return false;
  }

  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultMultiViewTabs);
    return this;
  }

  @Widget.Method()
  public onActiveKeyChange(tabKey: string) {
    super.onActiveKeyChange(tabKey);

    if (this.view?.name && this.multiViewKeyCache) {
      this.multiViewKeyCache.setActiveKey(tabKey);
    }
  }

  protected multiViewKeyCache!: ReturnType<MultiViewKeyCache>;

  protected $$beforeMount() {
    if (this.getActiveKey()) {
      return;
    }

    if (this.view?.name) {
      this.multiViewKeyCache = useMultiViewKeyCache(this.view.name);

      const { getActiveKey, setActiveKey } = this.multiViewKeyCache;
      const activeKey = getActiveKey();

      if (activeKey) {
        this.setActiveKey(activeKey);
      } else {
        const firstChild = this.getChildren()[0] as unknown as { viewName: string };

        firstChild && setActiveKey(firstChild.viewName);
      }
    } else {
      super.$$beforeMount();
    }
  }
}

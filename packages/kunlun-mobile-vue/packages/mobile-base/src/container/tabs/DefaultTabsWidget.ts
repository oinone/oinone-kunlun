import { SPI } from '@kunlun/spi';
import { OioTabPosition } from '@kunlun/vue-ui-common';
import { executeInvisible, InvisibleSupported, Widget } from '@kunlun/vue-widget';
import { isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import DefaultTabs from './DefaultTabs.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'tabs' }))
export class DefaultTabsWidget extends BasePackWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultTabs);
    return this;
  }

  @Widget.Reactive()
  protected activeKey: string | undefined;

  public getActiveKey() {
    return this.activeKey;
  }

  public setActiveKey(tabKey: string | undefined) {
    this.activeKey = tabKey;
  }

  @Widget.Reactive()
  protected get tabPosition() {
    const { tabPosition } = this.getDsl();
    if (tabPosition) {
      return tabPosition.toLowerCase();
    }
    return OioTabPosition.TOP;
  }

  @Widget.Reactive()
  public get layout(): string | undefined {
    const { layout } = this.getDsl();
    if (isString(layout)) {
      return layout.toLowerCase();
    }
    return undefined;
  }

  @Widget.Method()
  public onActiveKeyChange(tabKey: string) {
    this.setActiveKey(tabKey);
  }

  protected resetInvisible(): void {
    super.resetInvisible();
    const { invisibleFlags, activeIndex } = this.collectionInvisibleFlags();
    if (activeIndex !== -1) {
      const nextActiveIndex = this.findNextActiveIndex(invisibleFlags, activeIndex);
      if (nextActiveIndex !== -1) {
        const nextActiveKey = this.getChildren()[nextActiveIndex].getHandle();
        this.setActiveKey(nextActiveKey);
      }
    }
  }

  protected collectionInvisibleFlags() {
    const children = this.getChildren();
    const activeKey = this.getActiveKey();
    let activeIndex = -1;
    const invisibleFlags: boolean[] = [];
    for (let i = 0; i < children.length; i++) {
      const widget = children[i];
      const invisible = executeInvisible(widget as unknown as InvisibleSupported);
      invisibleFlags.push(invisible);
      if (activeIndex === -1 && activeKey && widget.getHandle() === activeKey && invisible) {
        activeIndex = i;
      }
    }
    return {
      invisibleFlags,
      activeIndex
    };
  }

  protected findNextActiveIndex(invisibleFlags: boolean[], currentActiveIndex: number) {
    let nextActiveIndex = -1;
    if (currentActiveIndex !== -1) {
      nextActiveIndex = this.$findNextActiveIndex(invisibleFlags, currentActiveIndex, -1);
      if (nextActiveIndex === -1) {
        nextActiveIndex = this.$findNextActiveIndex(invisibleFlags, currentActiveIndex, 1);
      }
    }
    return nextActiveIndex;
  }

  protected $findNextActiveIndex(invisibleFlags: boolean[], currentActiveIndex: number, direction: 1 | -1): number {
    for (
      let i = currentActiveIndex + direction;
      i !== currentActiveIndex && i < invisibleFlags.length;
      i += direction
    ) {
      if (!invisibleFlags[i]) {
        return i;
      }
    }
    return -1;
  }

  protected $$beforeMount() {
    super.$$beforeMount();
    if (this.getActiveKey() == null) {
      this.setActiveKey(this.getChildren()?.[0]?.getHandle());
    }
  }
}

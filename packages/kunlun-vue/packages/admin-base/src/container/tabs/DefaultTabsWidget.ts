import { CallChaining } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { OioTabAlign, OioTabPosition } from '@oinone/kunlun-vue-ui-common';
import { executeInvisible, InvisibleSupported, Widget } from '@oinone/kunlun-vue-widget';
import { isNil, isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import DefaultTabs from './DefaultTabs.vue';
import { DefaultTabWidget } from './DefaultTabWidget';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'tabs' }))
export class DefaultTabsWidget extends BasePackWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultTabs);
    return this;
  }

  @Widget.Reactive()
  @Widget.Inject('mountedCallChaining')
  protected parentMountedCallChaining: CallChaining | undefined;

  @Widget.Reactive()
  private activeKey: string | undefined;

  public getActiveKey() {
    return this.activeKey;
  }

  public setActiveKey(key: string | undefined) {
    this.activeKey = key;
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
  protected get tabAlign() {
    const { tabAlign } = this.getDsl();
    if (tabAlign) {
      return tabAlign.toLowerCase();
    }
    return OioTabAlign.LEFT;
  }

  @Widget.Reactive()
  public get layout(): string | undefined {
    const { layout } = this.getDsl();
    if (isString(layout)) {
      return layout.toLowerCase();
    }
    return undefined;
  }

  @Widget.Reactive()
  protected get defaultActiveIndex(): number | undefined {
    const { defaultActiveIndex } = this.getDsl();
    if (isNil(defaultActiveIndex)) {
      return undefined;
    }
    const activeIndex = Number(this.executeExpression<number>(defaultActiveIndex as string, 0));
    if (Number.isNaN(activeIndex)) {
      console.error('default active index compute error.', defaultActiveIndex);
      return undefined;
    }
    return activeIndex;
  }

  @Widget.Method()
  public onActiveKeyChange(key: string) {
    this.setActiveKey(key);
  }

  protected resetInvisible(): void {
    super.resetInvisible();
    const { invisibleFlags, activeIndex } = this.collectionInvisibleFlags();
    if (activeIndex !== -1) {
      const nextActiveIndex = this.findNextActiveIndex(invisibleFlags, activeIndex);
      if (nextActiveIndex !== -1) {
        const tabWidget = this.getChildren()[nextActiveIndex] as DefaultTabWidget;
        const nextActiveKey = tabWidget.currentTabKey || tabWidget.getHandle();
        this.setActiveKey(nextActiveKey);
      }
    } else if (activeIndex === -1) {
      const index = invisibleFlags.findIndex((v) => !v);

      if (index > -1) {
        const tabWidget = this.getChildren()[index] as DefaultTabWidget;
        const nextActiveKey = tabWidget.currentTabKey || tabWidget.getHandle();
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
      const widget = children[i] as DefaultTabWidget;
      const invisible = executeInvisible(widget as unknown as InvisibleSupported);
      invisibleFlags.push(invisible);
      if (activeIndex === -1 && activeKey && (widget.currentTabKey || widget.getHandle()) === activeKey && invisible) {
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

  protected defaultActiveKey: string | undefined;

  @Widget.Method()
  @Widget.Provide()
  protected reportDefaultActive(key: string) {
    if (!this.defaultActiveKey) {
      this.defaultActiveKey = key;
    }
  }

  protected computeDefaultActiveKey(): string | undefined {
    const { defaultActiveIndex } = this;
    let activeKey: string | undefined;
    if (defaultActiveIndex != null) {
      const tabWidget = this.getChildrenWidget()[defaultActiveIndex] as DefaultTabWidget;
      activeKey = tabWidget?.currentTabKey || tabWidget?.getHandle();
    }
    if (!activeKey) {
      activeKey = this.defaultActiveKey;
    }
    return activeKey;
  }

  /**
   * 页面挂载完成后，如果没有激活的key，说明tab配置了显隐表达式，如果需要激活第一个显示的tab
   */
  protected setActiveKeyWhenEmptyActiveKey() {
    const { invisibleFlags, activeIndex: initialActiveIndex } = this.collectionInvisibleFlags();
    const childrenWidgets = this.getChildrenWidget() as DefaultTabWidget[];

    if (initialActiveIndex === -1 && invisibleFlags.length > 0) {
      const newIndex = invisibleFlags.findIndex((flag) => !flag);
      if (newIndex > -1 && newIndex < childrenWidgets.length) {
        const tabWidget = childrenWidgets[newIndex];
        const nextActiveKey = tabWidget.currentTabKey || tabWidget.getHandle();
        this.setActiveKey(nextActiveKey);
      }
    }
  }

  protected $$mounted() {
    super.$$mounted();
    this.parentMountedCallChaining?.hook(this.path, () => {
      const defaultActiveKey = this.computeDefaultActiveKey();
      if (defaultActiveKey) {
        this.setActiveKey(defaultActiveKey);
      } else {
        this.setActiveKeyWhenEmptyActiveKey();
      }
      this.parentMountedCallChaining?.unhook(this.path);
    });
  }
}

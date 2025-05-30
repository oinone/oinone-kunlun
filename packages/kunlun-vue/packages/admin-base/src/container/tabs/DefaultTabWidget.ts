import { SPI } from '@kunlun/spi';
import { BooleanHelper, CallChaining, DEFAULT_TAB_TITLE, useTabBar } from '@kunlun/vue-ui-antd';
import { Widget } from '@kunlun/vue-widget';
import { isBoolean, isNil, isString } from 'lodash-es';
import { Component, createVNode, Slots, VNode } from 'vue';
import { BasePackWidget } from '../../basic';
import DefaultTab from './DefaultTab.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'tab' }))
export class DefaultTabWidget extends BasePackWidget {
  public initialize(props) {
    if (!props.template) {
      props.template = props.dslDefinition;
    }
    super.initialize(props);
    this.setComponent(DefaultTab);
    return this;
  }

  @Widget.Reactive()
  @Widget.Inject('mountedCallChaining')
  protected parentMountedCallChaining: CallChaining | undefined;

  @Widget.Method()
  @Widget.Inject()
  protected reportDefaultActive?: (key: string) => void;

  @Widget.Reactive()
  public get layout(): string | undefined {
    const { layout } = this.getDsl();
    if (isString(layout)) {
      return layout.toLowerCase();
    }
    return undefined;
  }

  @Widget.Reactive()
  public get title() {
    const { title } = this.getDsl();
    return title ? this.executeLabelExpression(title as string)! : DEFAULT_TAB_TITLE;
  }

  @Widget.Reactive()
  public get disabled(): boolean {
    const { disabled } = this.getDsl();
    if (disabled == null) {
      return false;
    }
    if (isString(disabled)) {
      return !!this.executeExpression<boolean>(disabled, false);
    }
    return !!disabled;
  }

  @Widget.Reactive()
  public get forceRender() {
    return true;
  }

  @Widget.Reactive()
  public get currentTabKey() {
    return this.currentHandle;
  }

  protected isDefaultActive(): boolean {
    const { defaultActive } = this.getDsl();
    if (isNil(defaultActive)) {
      return false;
    }
    if (isBoolean(defaultActive)) {
      return defaultActive;
    }
    if (isString(defaultActive)) {
      if (BooleanHelper.isStringBoolean(defaultActive)) {
        return !!BooleanHelper.toBoolean(defaultActive);
      }
      return !!this.executeExpression<boolean>(defaultActive as string, false);
    }
    return false;
  }

  protected renderWidgetComponent(widgetComponent: Component, context?: Record<string, unknown>, slots?: Slots): VNode {
    return createVNode(
      widgetComponent,
      {
        key: this.currentTabKey,
        invisible: this.invisible,
        disabled: this.disabled,
        forceRender: this.forceRender
      },
      {
        ...slots,
        tab: () => [useTabBar(this.title, this.help)]
      }
    );
  }

  protected $$mounted() {
    super.$$mounted();
    this.parentMountedCallChaining?.hook(this.path, () => {
      const isDefaultActive = this.isDefaultActive();
      if (isDefaultActive) {
        this.reportDefaultActive?.(this.currentTabKey);
      }
      this.parentMountedCallChaining?.unhook(this.path);
    });
  }
}

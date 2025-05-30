import { translateValueByKey } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { DEFAULT_COLLAPSE_PANEL_TITLE } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { isString } from 'lodash-es';
import { Component, createVNode, Slots, VNode } from 'vue';
import { BasePackWidget } from '../../basic';
import DefaultCollapsePanel from './DefaultCollapsePanel.vue';

@SPI.ClassFactory(BasePackWidget.Token({ widget: ['collapsePanel', 'collapse-panel', 'CollapsePanel'] }))
export class DefaultCollapsePanelWidget extends BasePackWidget {
  public initialize(props) {
    if (!props.template) {
      props.template = props.dslDefinition;
    }
    super.initialize(props);
    this.setComponent(DefaultCollapsePanel);
    return this;
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
  public get title() {
    const { title } = this.getDsl();
    if (title) {
      return this.executeLabelExpression(title as string);
    }
    return DEFAULT_COLLAPSE_PANEL_TITLE;
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

  protected renderWidgetComponent(widgetComponent: Component, context?: Record<string, unknown>, slots?: Slots): VNode {
    return createVNode(
      widgetComponent,
      {
        key: this.currentTabKey,
        header: translateValueByKey(this.title),
        invisible: this.invisible,
        disabled: this.disabled,
        forceRender: this.forceRender
      },
      slots
    );
  }
}

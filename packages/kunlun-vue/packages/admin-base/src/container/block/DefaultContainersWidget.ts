import { SPI } from '@oinone/kunlun-spi';
import {
  DEFAULT_CARD_CONTAINERS_GUTTERS,
  DEFAULT_CONTAINERS_GUTTERS,
  StandardGutterType,
  StyleHelper
} from '@oinone/kunlun-vue-ui-common';
import { isAllInvisible, Widget } from '@oinone/kunlun-vue-widget';
import { isString } from 'lodash-es';
import { BasePackWidget } from '../../basic';
import { DefaultContainerWidget } from './DefaultContainerWidget';
import { DefaultRowWidget } from './DefaultRowWidget';
import DefaultContainers from './DefaultContainers.vue';

function fetchContainerChildren(widgets: Widget[], level = 3): Widget[] {
  const children: Widget[] = [];
  for (const widget of widgets) {
    if (widget instanceof DefaultContainerWidget) {
      widget.getChildren().forEach((child) => children.push(child));
    } else if (level >= 1) {
      fetchContainerChildren(widget.getChildren(), level - 1).forEach((child) => children.push(child));
    }
  }
  return children;
}

@SPI.ClassFactory(BasePackWidget.Token({ widget: 'containers' }))
export class DefaultContainersWidget extends DefaultRowWidget {
  public initialize(props) {
    super.initialize(props);
    this.setComponent(DefaultContainers);
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

  /**
   * 是否显示内部边框
   */
  @Widget.Reactive()
  public get showInternalBorder(): boolean {
    return this.border;
  }

  @Widget.Reactive()
  @Widget.Provide('containersGutter')
  public get currentGutter(): number[] {
    return this.gutter;
  }

  /**
   * 行间距
   */
  @Widget.Reactive()
  public get rowGutter() {
    return StyleHelper.px(this.gutter[1] || 0);
  }

  /**
   * 列间距
   */

  @Widget.Reactive()
  public get colGutter() {
    return StyleHelper.px(this.gutter[0] || 0);
  }

  @Widget.Reactive()
  public get border(): boolean {
    const { border = false } = this.getDsl();
    return !!border;
  }

  /**
   * 是否显示上边框
   */
  @Widget.Reactive()
  public get borderTop(): boolean {
    const { borderTop = false } = this.getDsl();
    return !!borderTop || this.border;
  }

  /**
   * 是否显示右边框
   */
  @Widget.Reactive()
  public get borderRight(): boolean {
    const { borderRight = false } = this.getDsl();
    return !!borderRight || this.border;
  }

  /**
   * 是否显示下边框
   */
  @Widget.Reactive()
  public get borderBottom(): boolean {
    const { borderBottom = false } = this.getDsl();
    return !!borderBottom || this.border;
  }

  /**
   * 是否显示左边框
   */
  @Widget.Reactive()
  public get borderLeft(): boolean {
    const { borderLeft = false } = this.getDsl();
    return !!borderLeft || this.border;
  }

  /**
   * 边框大小
   */
  @Widget.Reactive()
  public get borderSize() {
    const { borderSize = 1 } = this.getDsl();
    return StyleHelper.px(borderSize);
  }

  /**
   * 边框颜色
   */
  @Widget.Reactive()
  public get borderColor() {
    const { borderColor } = this.getDsl();
    return borderColor;
  }

  /**
   * 边框样式
   */
  @Widget.Reactive()
  public get borderStyle() {
    const { borderStyle } = this.getDsl();
    return borderStyle?.toLocaleLowerCase();
  }

  @Widget.Reactive()
  public get paddingTop() {
    const { paddingTop = 0 } = this.getDsl();
    return StyleHelper.px(paddingTop);
  }

  @Widget.Reactive()
  public get paddingBottom() {
    const { paddingBottom = 0 } = this.getDsl();
    return StyleHelper.px(paddingBottom);
  }

  @Widget.Reactive()
  public get paddingLeft() {
    const { paddingLeft = 0 } = this.getDsl();
    return StyleHelper.px(paddingLeft);
  }

  @Widget.Reactive()
  public get paddingRight() {
    const { paddingRight = 0 } = this.getDsl();
    return StyleHelper.px(paddingRight);
  }

  /**
   * 内间距
   */
  @Widget.Reactive()
  public get padding() {
    return `${this.paddingTop} ${this.paddingRight} ${this.paddingBottom} ${this.paddingLeft}`;
  }

  @Widget.Reactive()
  public get marginTop() {
    const { marginTop = 0 } = this.getDsl();
    return StyleHelper.px(marginTop);
  }

  @Widget.Reactive()
  public get marginBottom() {
    const { marginBottom = 0 } = this.getDsl();
    return StyleHelper.px(marginBottom);
  }

  @Widget.Reactive()
  public get marginLeft() {
    const { marginLeft = 0 } = this.getDsl();
    return StyleHelper.px(marginLeft);
  }

  @Widget.Reactive()
  public get marginRight() {
    const { marginRight = 0 } = this.getDsl();
    return StyleHelper.px(marginRight);
  }

  /**
   * 外间距
   */
  @Widget.Reactive()
  public get margin() {
    return `${this.marginTop} ${this.marginRight} ${this.marginBottom} ${this.marginLeft}`;
  }

  protected childrenInvisibleProcess(): boolean {
    return isAllInvisible(fetchContainerChildren(this.getChildren()));
  }
}

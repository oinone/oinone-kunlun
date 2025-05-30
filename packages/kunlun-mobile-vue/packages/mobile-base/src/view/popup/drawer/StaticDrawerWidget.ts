import { IStaticDrawerWidget, translateValueByKey } from '@kunlun/engine';
import { DrawerHeight, DrawerPlacement, DrawerWidth, OioDrawerProps } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { PopupScene } from '../../../typing';
import { StaticPopupWidget } from '../StaticPopupWidget';
import DefaultDrawer from './DefaultDrawer.vue';
import { DrawerWidgetProps } from './DrawerWidget';

export class StaticDrawerWidget extends StaticPopupWidget<DrawerWidgetProps> implements IStaticDrawerWidget {
  protected getPopupScene(): string {
    return PopupScene.drawer;
  }

  public initialize(props: DrawerWidgetProps) {
    super.initialize(props);
    this.setComponent(DefaultDrawer);
    return this;
  }

  @Widget.Reactive()
  protected teleport: (() => HTMLElement) | undefined;

  @Widget.Reactive()
  protected destroyOnClose = true;

  @Widget.Reactive()
  protected title: string | null = OioDrawerProps.title.default;

  @Widget.Reactive()
  protected help: string | undefined;

  @Widget.Reactive()
  protected placement: string = DrawerPlacement.right;

  @Widget.Reactive()
  protected width: string | number = DrawerWidth.medium;

  @Widget.Reactive()
  protected height: string | number = DrawerHeight.medium;

  @Widget.Reactive()
  protected zIndex: number | undefined;

  @Widget.Reactive()
  protected maskClosable = false;

  @Widget.Reactive()
  protected headerInvisible = false;

  @Widget.Reactive()
  protected footerInvisible = false;

  @Widget.Reactive()
  protected okText = translateValueByKey('确认');

  @Widget.Reactive()
  protected okInvisible = false;

  @Widget.Reactive()
  protected cancelText = translateValueByKey('取消');

  @Widget.Reactive()
  protected cancelInvisible = false;

  @Widget.Reactive()
  protected actionLoading = false;

  @Widget.Reactive()
  protected actionReverse = false;

  public setTeleport(fn: () => HTMLElement) {
    this.teleport = fn;
  }

  public setDestroyOnClose(destroyOnClose: boolean) {
    this.destroyOnClose = destroyOnClose;
  }

  public setTitle(title: string | null) {
    this.title = title;
  }

  public setHelp(help: string | undefined) {
    this.help = help;
  }

  public setPlacement(placement: DrawerPlacement | keyof typeof DrawerPlacement) {
    this.placement = placement;
  }

  public setWidth(width: string | number) {
    this.width = width;
  }

  public setHeight(height: string | number) {
    this.height = height;
  }

  public setZIndex(zIndex: number | undefined) {
    this.zIndex = zIndex;
  }

  public setMaskClosable(maskClosable: boolean) {
    this.maskClosable = maskClosable;
  }

  public setHeaderInvisible(headerInvisible: boolean) {
    this.headerInvisible = headerInvisible;
  }

  public setFooterInvisible(footerInvisible: boolean) {
    this.footerInvisible = footerInvisible;
  }

  public setOkText(okText: string) {
    this.okText = okText;
  }

  public setOkInvisible(okInvisible: boolean) {
    this.okInvisible = okInvisible;
  }

  public setCancelText(cancelText: string) {
    this.cancelText = cancelText;
  }

  public setCancelInvisible(cancelInvisible: boolean) {
    this.cancelInvisible = cancelInvisible;
  }

  public setActionLoading(actionLoading: boolean) {
    this.actionLoading = actionLoading;
  }

  public setActionReverse(actionReverse: boolean) {
    this.actionReverse = actionReverse;
  }
}

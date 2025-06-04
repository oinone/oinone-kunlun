import { IStaticDialogWidget, translateValueByKey } from '@oinone/kunlun-engine';
import { ModalWidth, OioModalProps } from '@oinone/kunlun-vue-ui-common';
import { Widget } from '@oinone/kunlun-vue-widget';
import { PopupScene } from '../../../typing';
import { StaticPopupWidget } from '../StaticPopupWidget';
import DefaultDialog from './DefaultDialog.vue';
import { DialogWidgetProps } from './DialogWidget';

export class StaticDialogWidget extends StaticPopupWidget<DialogWidgetProps> implements IStaticDialogWidget {
  protected getPopupScene(): string {
    return PopupScene.dialog;
  }

  public initialize(props: DialogWidgetProps) {
    super.initialize(props);
    this.setComponent(DefaultDialog);
    return this;
  }

  @Widget.Reactive()
  private teleport: (() => HTMLElement) | undefined;

  @Widget.Reactive()
  private destroyOnClose = true;

  @Widget.Reactive()
  private title: string | null = OioModalProps.title.default;

  @Widget.Reactive()
  private help: string | undefined;

  @Widget.Reactive()
  private draggable = true;

  @Widget.Reactive()
  private width: string | number = ModalWidth.medium;

  @Widget.Reactive()
  private fixedHeight: string | undefined;

  @Widget.Reactive()
  private zIndex: number | undefined;

  @Widget.Reactive()
  private maskClosable = false;

  @Widget.Reactive()
  private headerInvisible = false;

  @Widget.Reactive()
  private footerInvisible = false;

  @Widget.Reactive()
  private okText = translateValueByKey('确认');

  @Widget.Reactive()
  private okInvisible = false;

  @Widget.Reactive()
  private cancelText = translateValueByKey('取消');

  @Widget.Reactive()
  private cancelInvisible = false;

  @Widget.Reactive()
  private actionLoading = false;

  @Widget.Reactive()
  private actionReverse = false;

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

  public setDraggable(draggable: boolean) {
    this.draggable = draggable;
  }

  public setWidth(width: string | number) {
    this.width = width;
  }

  public setFixedHeight(fixedHeight: string | undefined) {
    this.fixedHeight = fixedHeight;
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

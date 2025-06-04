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
  protected teleport: (() => HTMLElement) | undefined;

  @Widget.Reactive()
  protected destroyOnClose = true;

  @Widget.Reactive()
  protected title: string | null = OioModalProps.title.default;

  @Widget.Reactive()
  protected help: string | undefined;

  @Widget.Reactive()
  protected draggable = true;

  @Widget.Reactive()
  protected width: string | number = ModalWidth.medium;

  @Widget.Reactive()
  protected fixedHeight: string | undefined;

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

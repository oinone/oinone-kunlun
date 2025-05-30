import { DEFAULT_SLOT_NAME } from '@kunlun/dsl';
import { ROOT_HANDLE, RuntimeContext } from '@kunlun/engine';
import { BooleanHelper, Optional } from '@kunlun/shared';
import { DrawerPlacement, InnerPopupSize, OioDrawerProps } from '@kunlun/vue-ui-common';
import { Widget } from '@kunlun/vue-widget';
import { PopupScene } from '../../../typing';
import { PopupWidget } from '../PopupWidget';
import DefaultInnerPopup from './DefaultInnerPopup.vue';

export class InnerPopupWidget extends PopupWidget {
  protected getPopupScene(): PopupScene | string {
    return PopupScene.inner;
  }

  public initialize(props) {
    if (!props.slotNames) {
      props.slotNames = ['header', DEFAULT_SLOT_NAME, 'footer'];
    }
    super.initialize(props);
    this.setComponent(DefaultInnerPopup);
    return this;
  }

  @Widget.Reactive()
  protected get teleportHandle(): string {
    let handle = this.getDsl().teleportHandle;
    if (!handle) {
      let targetRuntimeContext: RuntimeContext | undefined = this.rootRuntimeContext;
      while (targetRuntimeContext && targetRuntimeContext.parentContext?.parentContext?.handle !== ROOT_HANDLE) {
        targetRuntimeContext = targetRuntimeContext.parentContext;
      }
      handle = targetRuntimeContext?.handle;
    }
    return handle;
  }

  @Widget.Reactive()
  protected get title() {
    return this.getDsl().title || OioDrawerProps.title.default;
  }

  @Widget.Reactive()
  protected get help() {
    return this.getDsl().help;
  }

  @Widget.Reactive()
  protected get size() {
    return this.getDsl().size?.toLowerCase?.() || InnerPopupSize.small;
  }

  @Widget.Reactive()
  protected get placement() {
    return this.getDsl().placement?.toLowerCase?.() || DrawerPlacement.right;
  }

  @Widget.Reactive()
  protected get closable() {
    return Optional.ofNullable(BooleanHelper.toBoolean(this.getDsl().closable)).orElse(true);
  }

  @Widget.Reactive()
  protected get okText() {
    return this.getDsl().okText;
  }

  @Widget.Reactive()
  protected get cancelText() {
    return this.getDsl().cancelText;
  }

  @Widget.Reactive()
  protected get headerInvisible(): boolean {
    const invisible = BooleanHelper.toBoolean(this.getDsl().headerInvisible);
    if (invisible == null) {
      return false;
    }
    return invisible;
  }

  @Widget.Reactive()
  protected get footerInvisible(): boolean {
    const invisible = BooleanHelper.toBoolean(this.getDsl().footerInvisible);
    if (invisible == null) {
      return false;
    }
    return invisible;
  }
}

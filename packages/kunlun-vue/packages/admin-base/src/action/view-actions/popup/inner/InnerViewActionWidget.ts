import { ActiveRecord, PopupManager } from '@kunlun/engine';
import { ActionType, ViewActionTarget } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseActionWidget } from '../../../../basic';
import { InnerPopupWidget } from '../../../../view/popup/inner';
import { PopupActionWidget } from '../PopupActionWidget';

@SPI.ClassFactory(
  BaseActionWidget.Token({
    actionType: ActionType.View,
    target: ViewActionTarget.Inner
  })
)
export class InnerViewActionWidget extends PopupActionWidget {
  protected innerPopup: InnerPopupWidget | undefined;

  protected createPopupWidget(data: ActiveRecord[]): void {
    const { popupDslDefinition } = this;
    if (!popupDslDefinition) {
      return;
    }
    const contextType = this.action?.contextType;
    let isFetchData = this.isFetchData(data);
    if (isFetchData === undefined && contextType) {
      // fixme @zbh 20221128 判断逻辑需要迁移，
      isFetchData = !this.isNotNeedFetchData(data, contextType);
    }
    const dslDefinition = this.createPopupDslDefinition()!;
    this.innerPopup = this.metadataSubviewWidget?.createWidget(new InnerPopupWidget(), undefined, {
      internal: true,
      template: dslDefinition,
      dataSource: isFetchData ? undefined : data,
      mountedVisible: true
    });
    if (this.innerPopup) {
      this.innerPopup.on('ok', async () => {
        this.onCloseInnerPopup();
      });
      this.innerPopup.on('cancel', () => {
        this.onCloseInnerPopup();
      });
    }
  }

  protected onCloseInnerPopup() {
    const handle = this.innerPopup?.getHandle();
    if (handle) {
      PopupManager.INSTANCE.dispose(handle);
    }

    this.metadataSubviewWidget?.dispose();
    this.metadataSubviewWidget = null as any;
    this.innerPopup?.dispose(true);
    this.innerPopup = null as any;

    this.getChildrenWidget().forEach((c) => c.dispose());
    this.childrenWidget = [];

    this.forceUpdate();
  }
}

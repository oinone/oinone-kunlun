import { ActiveRecord, PopupManager } from '@kunlun/engine';
import { ActionType, ViewActionTarget } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseActionWidget } from '../../../../basic';
import { InnerPopupWidget } from '../../../../view';
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
    const innerPopupWidget: InnerPopupWidget | undefined = this.metadataSubviewWidget?.createWidget(
      new InnerPopupWidget(),
      undefined,
      {
        internal: true,
        template: dslDefinition,
        dataSource: isFetchData ? undefined : data,
        mountedVisible: true
      }
    );
    if (innerPopupWidget) {
      innerPopupWidget.on('ok', async () => {
        this.onCloseInnerPopup();
      });
      innerPopupWidget.on('cancel', () => {
        this.onCloseInnerPopup();
      });
      this.innerPopup = innerPopupWidget;
    }
  }

  protected onCloseInnerPopup() {
    const handle = this.innerPopup?.getHandle();
    if (handle) {
      PopupManager.INSTANCE.dispose(handle);
    }
  }
}

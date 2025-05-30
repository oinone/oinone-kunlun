import { ActiveRecord, PopupManager } from '@kunlun/engine';
import { ActionType, ViewActionTarget } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseActionWidget } from '../../../../basic';
import { DialogWidget } from '../../../../view';
import { PopupActionWidget } from '../PopupActionWidget';

@SPI.ClassFactory(
  BaseActionWidget.Token({
    actionType: [ActionType.View],
    target: [ViewActionTarget.Dialog]
  })
)
export class DialogViewActionWidget extends PopupActionWidget {
  protected dialog: DialogWidget | undefined;

  protected createPopupWidget(data: ActiveRecord[]): void {
    const { popupDslDefinition } = this;
    if (!popupDslDefinition) {
      return;
    }
    const dslDefinition = this.createPopupDslDefinition()!;
    const contextType = this.action?.contextType;
    let isFetchData = this.isFetchData(data);
    if (isFetchData === undefined && contextType) {
      // fixme @zbh 20221128 判断逻辑需要迁移，
      isFetchData = !this.isNotNeedFetchData(data, contextType);
    }
    const dialogWidget: DialogWidget | undefined = this.metadataSubviewWidget?.createWidget(
      new DialogWidget(),
      undefined,
      {
        internal: true,
        template: dslDefinition,
        dataSource: isFetchData ? undefined : data,
        mountedVisible: true
      }
    );
    if (dialogWidget) {
      dialogWidget.on('ok', async () => {
        this.onCloseDialog();
      });
      dialogWidget.on('cancel', () => {
        this.onCloseDialog();
      });
      this.dialog = dialogWidget;
    }
  }

  protected onCloseDialog() {
    const handle = this.dialog?.getHandle();
    if (handle) {
      PopupManager.INSTANCE.dispose(handle);
      if (!PopupManager.INSTANCE.getInstances().length) {
        this.onShowActionsPopup?.(false);
      }
    }
  }
}

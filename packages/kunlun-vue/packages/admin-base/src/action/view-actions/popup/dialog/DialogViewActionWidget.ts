import { ActiveRecord, PopupManager } from '@oinone/kunlun-engine';
import { ActionType, ViewActionTarget } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseActionWidget } from '../../../../basic';
import { DialogWidget } from '../../../../view/popup/dialog';
import { PopupActionWidget } from '../PopupActionWidget';

@SPI.ClassFactory(
  BaseActionWidget.Token({
    actionType: ActionType.View,
    target: ViewActionTarget.Dialog
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
    this.dialog = this.metadataSubviewWidget?.createWidget(new DialogWidget(), undefined, {
      internal: true,
      template: dslDefinition,
      dataSource: isFetchData ? undefined : data,
      mountedVisible: true
    });
    if (this.dialog) {
      this.dialog.on('ok', async () => {
        this.onCloseDialog();
      });
      this.dialog.on('cancel', () => {
        this.onCloseDialog();
      });
    }
  }

  protected onCloseDialog() {
    const handle = this.dialog?.getHandle();
    if (handle) {
      PopupManager.INSTANCE.dispose(handle);
    }

    this.metadataSubviewWidget?.dispose();
    this.metadataSubviewWidget = null as any;
    this.dialog?.dispose(true);
    this.dialog = null as any;

    this.getChildrenWidget().forEach((c) => c.dispose());
    this.childrenWidget = [];

    this.forceUpdate();
  }
}

import { IPopupWidget, PopupManager } from '@kunlun/engine';
import { ReturnPromise } from '@kunlun/shared';
import { SPIFactory } from '@kunlun/spi';
import { RootComponentSPI } from '../../spi';
import { PopupScene } from '../../typing';
import { DialogWidget } from '../../view';
import { PopupContainerWidget, PopupInfo } from './PopupContainerWidget';

@SPIFactory.Register(RootComponentSPI.Token({ widget: 'dialog-container' }))
export class DialogContainerWidget extends PopupContainerWidget {
  protected getPopupScene(): PopupScene | string {
    return PopupScene.dialog;
  }

  protected createPopupWidget(popupInfo: PopupInfo): ReturnPromise<IPopupWidget | undefined> {
    const { key, popupDslDefinition, runtimeContext, metadataWidget } = popupInfo;
    if (!popupDslDefinition || !metadataWidget || !runtimeContext) {
      return undefined;
    }
    const { dslDefinition } = popupDslDefinition;
    const runtimeContextHandle = runtimeContext.handle;
    const dialogWidget = metadataWidget.createWidget(new DialogWidget(key), undefined, {
      metadataHandle: runtimeContextHandle,
      rootHandle: runtimeContextHandle,
      internal: true,
      template: dslDefinition,
      mountedVisible: true
    });
    dialogWidget.on('ok', async () => {
      this.onCloseDialog(dialogWidget);
    });
    dialogWidget.on('cancel', () => {
      this.onCloseDialog(dialogWidget);
    });
    return dialogWidget;
  }

  protected onCloseDialog(dialog: DialogWidget) {
    const handle = dialog.getHandle();
    if (handle) {
      PopupManager.INSTANCE.dispose(handle);
    }
  }
}

import { IPopupWidget, PopupManager } from '@oinone/kunlun-engine';
import { ReturnPromise } from '@oinone/kunlun-shared';
import { SPIFactory } from '@oinone/kunlun-spi';
import { RootComponentSPI } from '../../spi';
import { PopupScene } from '../../typing';
import { DrawerWidget } from '../../view';
import { PopupContainerWidget, PopupInfo } from './PopupContainerWidget';

@SPIFactory.Register(RootComponentSPI.Token({ widget: 'drawer-container' }))
export class DrawerContainerWidget extends PopupContainerWidget {
  protected getPopupScene(): PopupScene | string {
    return PopupScene.drawer;
  }

  protected createPopupWidget(popupInfo: PopupInfo): ReturnPromise<IPopupWidget | undefined> {
    const { key, popupDslDefinition, runtimeContext, metadataWidget } = popupInfo;
    if (!popupDslDefinition || !metadataWidget || !runtimeContext) {
      return undefined;
    }
    const { dslDefinition } = popupDslDefinition;
    const runtimeContextHandle = runtimeContext.handle;
    const drawerWidget = metadataWidget.createWidget(new DrawerWidget(key), undefined, {
      metadataHandle: runtimeContextHandle,
      rootHandle: runtimeContextHandle,
      internal: true,
      template: dslDefinition,
      mountedVisible: true
    });
    drawerWidget.on('ok', async () => {
      this.onCloseDrawer(drawerWidget);
    });
    drawerWidget.on('cancel', () => {
      this.onCloseDrawer(drawerWidget);
    });
    return drawerWidget;
  }

  protected onCloseDrawer(drawer: DrawerWidget) {
    const handle = drawer.getHandle();
    if (handle) {
      PopupManager.INSTANCE.dispose(handle);
    }
  }
}

import { ActiveRecord, PopupManager } from '@oinone/kunlun-engine';
import { ActionType, ViewActionTarget } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { BaseActionWidget } from '../../../../basic';
import { DrawerWidget } from '../../../../view';
import { PopupActionWidget } from '../PopupActionWidget';

@SPI.ClassFactory(
  BaseActionWidget.Token({
    actionType: ActionType.View,
    target: ViewActionTarget.Drawer
  })
)
export class DrawerViewActionWidget extends PopupActionWidget {
  protected drawer: DrawerWidget | undefined;

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
    const drawerWidget: DrawerWidget | undefined = this.metadataSubviewWidget?.createWidget(
      new DrawerWidget(),
      undefined,
      {
        internal: true,
        template: dslDefinition,
        dataSource: isFetchData ? undefined : data,
        mountedVisible: true
      }
    );
    if (drawerWidget) {
      drawerWidget.on('ok', async () => {
        this.onCloseDrawer();
      });
      drawerWidget.on('cancel', () => {
        this.onCloseDrawer();
      });
      this.drawer = drawerWidget;
    }
  }

  protected onCloseDrawer() {
    const handle = this.drawer?.getHandle();
    if (handle) {
      PopupManager.INSTANCE.dispose(handle);

      if (!PopupManager.INSTANCE.getInstances()) {
        this.onShowActionsPopup?.(false);
      }
    }
  }
}

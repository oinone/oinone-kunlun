import { ActiveRecord, PopupManager } from '@kunlun/engine';
import { ActionType, ViewActionTarget } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { BaseActionWidget } from '../../../../basic';
import { DrawerWidget } from '../../../../view/popup/drawer';
import { PopupActionWidget } from '../PopupActionWidget';

@SPI.ClassFactory(
  BaseActionWidget.Token({
    actionType: ActionType.View,
    target: ViewActionTarget.Drawer
  })
)
export class DrawerViewActionWidget extends PopupActionWidget {
  private drawer: DrawerWidget | undefined;

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
    this.drawer = this.metadataSubviewWidget?.createWidget(new DrawerWidget(), undefined, {
      internal: true,
      template: dslDefinition,
      dataSource: isFetchData ? undefined : data,
      mountedVisible: true
    });
    if (this.drawer) {
      this.drawer.on('ok', async () => {
        this.onCloseDrawer();
      });
      this.drawer.on('cancel', () => {
        this.onCloseDrawer();
      });
    }
  }

  protected onCloseDrawer() {
    const handle = this.drawer?.getHandle();
    if (handle) {
      PopupManager.INSTANCE.dispose(handle);
    }

    this.metadataSubviewWidget?.dispose();
    this.metadataSubviewWidget = null as any;
    this.drawer?.dispose(true);
    this.drawer = null as any;

    this.getChildrenWidget().forEach((c) => c.dispose());
    this.childrenWidget = [];

    this.forceUpdate();
  }
}

import { ActionType, ViewActionTarget } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { ActionWidget } from '../../component';
import { DrawerViewActionWidget } from '../popup/drawer';

@SPI.ClassFactory(
  ActionWidget.Token({
    actionType: [ActionType.View],
    target: [ViewActionTarget.Drawer],
    widget: 'BatchUpdate'
  })
)
export class DrawerBatchUpdateViewAction extends DrawerViewActionWidget {
  protected isFetchData(records) {
    return false;
  }
}

import { ActionType, ViewActionTarget } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { ActionWidget } from '../../component';
import { DialogViewActionWidget } from '../popup/dialog';

@SPI.ClassFactory(
  ActionWidget.Token({
    actionType: [ActionType.View],
    target: [ViewActionTarget.Dialog],
    widget: 'BatchUpdate'
  })
)
export class DialogBatchUpdateViewAction extends DialogViewActionWidget {
  protected isFetchData(records) {
    return false;
  }
}

import { ActionType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { ActionWidget, ServerActionWidget } from '../../action';
import { ClickResult } from '../../typing';
import { groupChangeBehavior } from './constants';

@SPI.ClassFactory(ActionWidget.Token({ actionType: ActionType.Server, widget: 'iconEditConfirmAction' }))
export class IconEditConfirmActionWidget extends ServerActionWidget {
  // 编辑修改分组后，搜索栏的分组也要同步更新
  protected async clickActionAfterRefreshData(result: ClickResult, refreshParent = false): Promise<ClickResult> {
    groupChangeBehavior.next('iconEdit');

    this.refreshCallChaining?.syncCall(refreshParent);
    return result;
  }
}

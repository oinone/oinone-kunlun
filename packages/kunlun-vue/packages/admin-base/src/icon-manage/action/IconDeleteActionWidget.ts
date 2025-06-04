import { ActionType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { ActionWidget, ServerActionWidget } from '../../action';
import { ClickResult } from '../../typing';
import { groupChangeBehavior } from './constants';

@SPI.ClassFactory(ActionWidget.Token({ actionType: ActionType.Server, widget: 'iconDeleteAction' }))
export class IconDeleteActionWidget extends ServerActionWidget {
  // 删除动作点击后，搜索栏的分组也要同步更新
  protected async clickActionAfterRefreshData(result: ClickResult, refreshParent = false): Promise<ClickResult> {
    groupChangeBehavior.next('iconDelete');

    this.refreshCallChaining?.syncCall(refreshParent);
    return result;
  }
}

import { ActiveRecord } from '@oinone/kunlun-engine';
import { ActionType } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { ActionWidget, ServerActionWidget } from '../../action';
import { ClickResult } from '../../typing';
import { IconActionBarWidget } from './IconActionBarWidget';

@SPI.ClassFactory(ActionWidget.Token({ actionType: ActionType.Server, widget: 'iconVisibilityAction' }))
export class IconVisibilityActionWidget extends ServerActionWidget {
  // 显隐动作点击后，更新 父和兄弟 activeRecords，以确保数据正确更新
  protected async clickActionAfterRefreshData(result: ClickResult, refreshParent = false): Promise<ClickResult> {
    const parentWidget = this.getParent() as IconActionBarWidget;
    if (parentWidget && parentWidget.activeRecords && parentWidget.activeRecords.length) {
      parentWidget.activeRecords[0] = result as ActiveRecord;
      parentWidget.getChildren().forEach((childWidget) => {
        if (childWidget instanceof ActionWidget && childWidget.activeRecords && childWidget.activeRecords.length) {
          childWidget.activeRecords[0] = result as ActiveRecord;
        }
      });
    }
    this.refreshCallChaining?.syncCall(refreshParent);
    return result;
  }
}

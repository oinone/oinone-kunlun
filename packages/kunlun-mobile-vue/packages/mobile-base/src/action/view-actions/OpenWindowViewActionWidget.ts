import { executeViewAction, MultiTabsRuntimeManifestMergedConfigManager, RedirectTargetEnum, type RuntimeViewAction } from '@oinone/kunlun-engine';
import { ActionType, type Entity, ViewActionTarget } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { ActionWidget } from '../component';
import { RouterViewActionWidget } from './RouterViewActionWidget';

@SPI.ClassFactory(ActionWidget.Token({ actionType: [ActionType.View], target: [ViewActionTarget.OpenWindow] }))
export class OpenWindowViewActionWidget extends RouterViewActionWidget {
  protected realExecuteAction(action: RuntimeViewAction, extraParam: Entity) {
    let target: RedirectTargetEnum | undefined = RedirectTargetEnum.BLANK;
    // 移动端不支持多tab
    // if (MultiTabsRuntimeManifestMergedConfigManager.isEnabled()) {
    //   target = undefined;
    // }
    executeViewAction(action, this.router, this.matched, extraParam, target);
  }
}

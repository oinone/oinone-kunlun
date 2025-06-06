import {
  executeViewAction,
  MultiTabsRuntimeManifestMergedConfigManager,
  RedirectTargetEnum,
  RuntimeViewAction
} from '@oinone/kunlun-engine';
import { ActionType, ViewActionTarget } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { UrlQueryParameters } from '../../basic';
import { ActionWidget } from '../component';
import { RouterViewActionWidget } from './RouterViewActionWidget';

@SPI.ClassFactory(
  ActionWidget.Token({
    actionType: ActionType.View,
    target: ViewActionTarget.OpenWindow
  })
)
export class OpenWindowViewActionWidget extends RouterViewActionWidget {
  protected executeAction(action: RuntimeViewAction, parameters: UrlQueryParameters) {
    let target: RedirectTargetEnum | undefined = RedirectTargetEnum.BLANK;
    if (MultiTabsRuntimeManifestMergedConfigManager.isEnabled()) {
      target = undefined;
    }
    executeViewAction(action, this.router, this.matched, parameters, target);
  }
}

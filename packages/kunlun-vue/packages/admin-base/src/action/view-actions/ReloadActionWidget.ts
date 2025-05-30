import { ModelDefaultActionName } from '@kunlun/meta';
import { translateValueByKey } from '@kunlun/engine';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';

import { ActionWidget } from '../component';

@SPI.ClassFactory(
  ActionWidget.Token({
    name: ModelDefaultActionName.$$internal_ReloadData
  })
)
export class ReloadViewActionWidget extends ActionWidget {
  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('刷新');
  }

  public clickAction() {
    this.refreshCallChaining?.syncCall(false);
  }
}

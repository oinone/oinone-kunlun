import { ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';

import { ActionWidget } from '../component';
import { translateValueByKey } from '@oinone/kunlun-engine';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_ReloadData }))
export class ReloadViewActionWidget extends ActionWidget {
  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('刷新');
  }

  public clickAction() {
    this.refreshCallChaining?.syncCall(false);
  }
}

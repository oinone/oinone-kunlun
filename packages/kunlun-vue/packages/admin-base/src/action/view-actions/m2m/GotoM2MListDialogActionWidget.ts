import { ActionContextType, ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { ActionWidget } from '../../component';
import { DialogViewActionWidget } from '../popup/dialog';

@SPI.ClassFactory(ActionWidget.Token({ name: ModelDefaultActionName.$$internal_GotoM2MListDialog }))
export class GotoM2MListDialogActionWidget extends DialogViewActionWidget {
  public initialize(props) {
    super.initialize(props);
    const { action } = this;
    if (action) {
      action.contextType = action.contextType || ActionContextType.ContextFree;
    }
    return this;
  }

  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('添加');
  }
}

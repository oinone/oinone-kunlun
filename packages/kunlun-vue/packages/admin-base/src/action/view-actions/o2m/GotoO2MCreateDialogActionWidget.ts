import { translateValueByKey } from '@oinone/kunlun-engine';
import { ActionContextType, ModelDefaultActionName } from '@oinone/kunlun-meta';
import { SPI } from '@oinone/kunlun-spi';
import { Widget } from '@oinone/kunlun-vue-widget';
import { ActionWidget } from '../../component';
import { DialogViewActionWidget } from '../popup/dialog';

@SPI.ClassFactory(
  ActionWidget.Token({
    name: ModelDefaultActionName.$$internal_GotoO2MCreateDialog
  })
)
export class GotoO2MCreateDialogActionWidget extends DialogViewActionWidget {
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
    return this.getDsl().label || this.action?.displayName || translateValueByKey('创建');
  }
}

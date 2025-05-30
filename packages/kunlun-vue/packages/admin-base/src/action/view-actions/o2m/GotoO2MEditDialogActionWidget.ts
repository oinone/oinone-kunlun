import { translateValueByKey } from '@kunlun/engine';
import { ActionContextType, ModelDefaultActionName } from '@kunlun/meta';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { ActionWidget } from '../../component';
import { DialogViewActionWidget } from '../popup/dialog';

@SPI.ClassFactory(
  ActionWidget.Token({
    name: ModelDefaultActionName.$$internal_GotoO2MEditDialog
  })
)
export class GotoO2MEditDialogActionWidget extends DialogViewActionWidget {
  public initialize(props) {
    super.initialize(props);
    const { action } = this;
    if (action) {
      action.contextType = action.contextType || ActionContextType.Single;
    }
    return this;
  }

  @Widget.Reactive()
  protected get label() {
    return this.getDsl().label || this.action?.displayName || translateValueByKey('编辑');
  }
}
